
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

    const videoId = response.data.guid;

    res.json({
      videoId,
      libraryId: process.env.BUNNY_LIBRARY_ID,
    });
  } catch (error) {
    console.log(error.response?.data || error.message);

    res.status(500).json({
      error: "Video oluşturulamadı",
      detail: error.response?.data || error.message,
    });
  }
});

/**
 * VIDEO UPLOAD (DÜZELTİLMİŞ)
 */
app.post("/upload-video", async (req, res) => {
  try {
    const { libraryId, videoId } = req.query;

    if (!libraryId || !videoId) {
      return res.status(400).json({ error: "libraryId ve videoId gerekli" });
    }

    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    const response = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
      {
        method: "PUT",
        headers: {
          AccessKey: process.env.BUNNY_API_KEY,
          "Content-Type": "application/octet-stream",
        },
        body: buffer,
      }
    );

    const text = await response.text();

    if (!response.ok) {
      console.log(text);
      return res.status(500).send(text);
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Upload error");
  }
});

/**
 * PORT
 */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
