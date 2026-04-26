import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

// 🔍 TEST
app.get("/", (req, res) => {
  res.send("API çalışıyor 🚀");
});

// 🎬 CREATE VIDEO (Bunny)
app.post("/create-video", async (req, res) => {
  try {
    if (!process.env.BUNNY_LIBRARY_ID || !process.env.BUNNY_API_KEY || !process.env.BUNNY_CDN_HOST) {
      return res.status(500).json({ error: "Env eksik (BUNNY vars)" });
    }

    // 1. Bunny'de video oluştur
    const response = await fetch(
      `https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos`,
      {
        method: "POST",
        headers: {
          AccessKey: process.env.BUNNY_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: req.body?.title || "video",
        }),
      }
    );

    const data = await response.json();

    if (!data || !data.guid) {
      return res.status(500).json({ error: "Bunny video oluşturulamadı", data });
    }

    const videoId = data.guid;

    // 2. Upload URL (PUT yapılacak)
    const uploadUrl = `https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos/${videoId}`;

    // 3. Playback URL (HLS stream)
    const playbackUrl = `https://${process.env.BUNNY_CDN_HOST}/${videoId}/playlist.m3u8`;

    // 🔥 FRONTEND'E GÖNDERİLEN HER ŞEY
    res.json({
      videoId,
      uploadUrl,
      playbackUrl,
      apiKey: process.env.BUNNY_API_KEY, // ⚠️ sadece test için
    });
  } catch (err) {
    console.error("CREATE VIDEO ERROR:", err);
    res.status(500).json({ error: "create-video failed" });
  }
});

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
