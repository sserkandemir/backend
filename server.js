import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import multer from "multer";
import fs from "fs";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

// Upload temp
const upload = multer({ dest: "uploads/" });

// 🔍 TEST
app.get("/", (req, res) => {
  res.send("API çalışıyor 🚀");
});


// 🎬 VIDEO CREATE
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
          title: req.body?.title || "video",
        }),
      }
    );

    const data = await response.json();

    if (!data.guid) {
      return res.status(500).json({ error: "Bunny create hatası", data });
    }

    const videoId = data.guid;

    res.json({
      videoId,
      uploadUrl: `https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos/${videoId}`,
      playbackUrl: `https://${process.env.BUNNY_CDN_HOST}/${videoId}/playlist.m3u8`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "create-video failed" });
  }
});


// 🚀 DIRECT UPLOAD (FFMPEG YOK)
app.post("/upload-compressed", upload.single("video"), async (req, res) => {
  try {
    const inputPath = req.file.path;

    console.log("📤 Direkt upload başlıyor...");

    const fileBuffer = fs.readFileSync(inputPath);

    // 1. Bunny create
    const createRes = await fetch(
      `https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos`,
      {
        method: "POST",
        headers: {
          AccessKey: process.env.BUNNY_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: "video" }),
      }
    );

    const data = await createRes.json();
    const videoId = data.guid;

    if (!videoId) {
      throw new Error("Bunny video oluşturulamadı");
    }

    // 2. Upload
    const uploadRes = await fetch(
      `https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos/${videoId}`,
      {
        method: "PUT",
        headers: {
          AccessKey: process.env.BUNNY_API_KEY,
          "Content-Type": "application/octet-stream",
        },
        body: fileBuffer,
      }
    );

    if (!uploadRes.ok) {
      throw new Error("Bunny upload başarısız");
    }

    console.log("🚀 Bunny upload tamam");

    const playbackUrl = `https://${process.env.BUNNY_CDN_HOST}/${videoId}/playlist.m3u8`;

    // temp dosya sil
    fs.unlinkSync(inputPath);

    res.json({ playbackUrl });

  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ error: "upload failed" });
  }
});


app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
