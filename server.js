import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import multer from "multer";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import fs from "fs";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

// FFmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

// Upload temp
const upload = multer({ dest: "uploads/" });

// 🔍 TEST
app.get("/", (req, res) => {
  res.send("API çalışıyor 🚀");
});


// 🎬 NORMAL CREATE (fallback)
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


// 🔥🔥🔥 ANA SİSTEM (INSTAGRAM LEVEL)
app.post("/upload-compressed", upload.single("video"), async (req, res) => {
  try {
    const inputPath = req.file.path;
    const outputPath = `uploads/output_${Date.now()}.mp4`;

    console.log("🎬 Video compress başlıyor...");

    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .videoCodec("libx264")
        .audioCodec("aac")
        .size("720x?")
        .outputOptions([
          "-preset veryfast",
          "-crf 28",
          "-movflags +faststart",
          "-b:a 128k",
        ])
        .on("end", resolve)
        .on("error", reject)
        .save(outputPath);
    });

    console.log("✅ Compress tamamlandı");

    const fileBuffer = fs.readFileSync(outputPath);

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

    // 2. Upload
    await fetch(
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

    console.log("🚀 Bunny upload tamam");

    const playbackUrl = `https://${process.env.BUNNY_CDN_HOST}/${videoId}/playlist.m3u8`;

    // temizle
    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);

    res.json({ playbackUrl });

  } catch (err) {
    console.error("❌ Compression error:", err);
    res.status(500).json({ error: "compression failed" });
  }
});


app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
