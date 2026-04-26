import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

// TEST
app.get("/", (req, res) => {
  res.send("API çalışıyor 🚀");
});

// 🎬 VIDEO CREATE + PLAYBACK URL
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
          title: req.body.title || "video",
        }),
      }
    );

    const data = await response.json();

    if (!data.guid) {
      return res.status(500).json({ error: "Video oluşturulamadı" });
    }

    const videoId = data.guid;

    // 🔥 upload link
    const uploadUrl = `https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos/${videoId}`;

    // 🔥 izleme linki (EN ÖNEMLİ)
    const videoUrl = `https://${process.env.BUNNY_CDN_HOST}/${videoId}/playlist.m3u8`;

    res.json({
      success: true,
      videoId,
      uploadUrl,
      videoUrl, // 🔥 frontend bunu kullanacak
    });
  } catch (err) {
    console.error("CREATE VIDEO ERROR:", err);
    res.status(500).json({ error: "create failed" });
  }
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
