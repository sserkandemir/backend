
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
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
      { title: "Test Video" },
      {
        headers: {
          AccessKey: process.env.BUNNY_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      videoId: response.data.guid,
      libraryId: process.env.BUNNY_LIBRARY_ID,
    });
  } catch (err) {
    console.log(err.response?.data || err.message);
    res.status(500).json({ error: "create-video failed" });
  }
});

/**
 * 🔥 GERÇEK UPLOAD
 */
app.post("/upload-video", async (req, res) => {
  try {
    const { videoId, libraryId } = req.query;

    if (!videoId || !libraryId) {
      return res.status(400).json({ error: "videoId & libraryId gerekli" });
    }

    const uploadUrl = `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`;

    const response = await axios.put(uploadUrl, req, {
      headers: {
        AccessKey: process.env.BUNNY_API_KEY,
        "Content-Type": "application/octet-stream",
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    res.json({ success: true });
  } catch (err) {
    console.log("UPLOAD ERROR:", err.response?.data || err.message);

    res.status(500).json({
      error: "upload failed",
      detail: err.response?.data || err.message,
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
