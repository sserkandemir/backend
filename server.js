const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());

// 🔥 BUNU EKLE (EN KRİTİK)
app.use(express.raw({ type: "*/*", limit: "200mb" }));
app.use(express.json());

/**
 * TEST
 */
app.get("/", (req, res) => {
  res.send("Backend çalışıyor 🚀");
});

/**
 * VIDEO OLUŞTUR
 */
app.post("/create-video", async (req, res) => {
  try {
    const response = await axios.post(
      `https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos`,
      {
        title: req.body.title || "Video",
      },
      {
        headers: {
          AccessKey: process.env.BUNNY_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const videoId = response.data.guid;

    console.log("VIDEO CREATED:", videoId);

    res.json({
      videoId,
      libraryId: process.env.BUNNY_LIBRARY_ID,
    });
  } catch (error) {
    console.log("CREATE ERROR:", error.response?.data || error.message);

    res.status(500).json({
      error: "Video oluşturulamadı",
      detail: error.response?.data || error.message,
    });
  }
});

/**
 * 🔥 UPLOAD (EN KRİTİK KISIM)
 */
app.post("/upload-video", async (req, res) => {
  try {
    const { videoId, libraryId } = req.query;

    if (!videoId || !libraryId) {
      return res.status(400).json({
        error: "videoId ve libraryId gerekli",
      });
    }

    console.log("UPLOAD START:", videoId);

    const uploadUrl = `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`;

    await axios.put(uploadUrl, req.body, {
      headers: {
        AccessKey: process.env.BUNNY_API_KEY,
        "Content-Type": "application/octet-stream",
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    console.log("UPLOAD SUCCESS");

    res.json({ success: true });
  } catch (error) {
    console.log("UPLOAD ERROR:", error.response?.data || error.message);

    res.status(500).json({
      error: "Upload başarısız",
      detail: error.response?.data || error.message,
    });
  }
});

/**
 * PORT
 */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
