
const express = require("express");
const cors = require("cors");

const app = express();

/**
 * 🔥 KRİTİK: raw body (video için)
 */
app.use(cors());
app.use(express.json());
app.use(express.raw({ type: "*/*", limit: "500mb" }));

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
    const response = await fetch(
      `https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos`,
      {
        method: "POST",
        headers: {
          AccessKey: process.env.BUNNY_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: req.body.title || "Test Video",
        }),
      }
    );

    const data = await response.json();

    res.json({
      videoId: data.guid,
      libraryId: process.env.BUNNY_LIBRARY_ID,
    });
  } catch (error) {
    console.log("CREATE ERROR:", error);

    res.status(500).json({
      error: "Video oluşturulamadı",
    });
  }
});

/**
 * 🔥 VIDEO UPLOAD (EN ÖNEMLİ KISIM)
 */
app.post("/upload-video", async (req, res) => {
  try {
    const { videoId, libraryId } = req.query;

    if (!videoId || !libraryId) {
      return res.status(400).json({
        error: "videoId & libraryId gerekli",
      });
    }

    const uploadUrl = `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`;

    console.log("UPLOAD START:", videoId);

    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        AccessKey: process.env.BUNNY_API_KEY,
        "Content-Type": "application/octet-stream",
      },
      body: req, // 🔥 stream direkt geçiyor
    });

    const text = await response.text();

    console.log("BUNNY RESPONSE:", text);

    if (!response.ok) {
      return res.status(500).json({
        error: text,
      });
    }

    console.log("UPLOAD SUCCESS:", videoId);

    res.json({ success: true });
  } catch (error) {
    console.log("UPLOAD ERROR:", error);

    res.status(500).json({
      error: "Upload failed",
      detail: error.message,
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
