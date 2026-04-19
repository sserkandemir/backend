
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

/**
 * 🔥 ÖNEMLİ SIRALAMA
 */
app.use(cors());
app.use(express.json());
app.use(express.raw({ type: "application/octet-stream", limit: "500mb" }));

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
        title: req.body.title || "Test Video"
      },
      {
        headers: {
          AccessKey: process.env.BUNNY_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({
      videoId: response.data.guid,
      libraryId: process.env.BUNNY_LIBRARY_ID
    });

  } catch (error) {
    console.log("CREATE ERROR:", error.response?.data || error.message);

    res.status(500).json({
      error: "Video oluşturulamadı",
      detail: error.response?.data || error.message
    });
  }
});

/**
 * 🔥 GERÇEK UPLOAD (EN KRİTİK)
 */
app.post("/upload-video", async (req, res) => {
  try {
    const { videoId, libraryId } = req.query;

    if (!videoId || !libraryId) {
      return res.status(400).json({
        error: "videoId & libraryId gerekli"
      });
    }

    const uploadUrl = `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`;

    console.log("UPLOAD START:", videoId);

    await axios({
      method: "put",
      url: uploadUrl,
      data: req,
      headers: {
        AccessKey: process.env.BUNNY_API_KEY,
        "Content-Type": "application/octet-stream"
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    console.log("UPLOAD SUCCESS:", videoId);

    res.json({ success: true });

  } catch (error) {
    console.log("UPLOAD ERROR:", error.response?.data || error.message);

    res.status(500).json({
      error: "Upload failed",
      detail: error.response?.data || error.message
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
