import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import multer from "multer";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import fs from "fs";
import path from "path";

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

const PORT = process.env.PORT || 8080;

// 🔍 TEST
app.get("/", (req, res) => {
  res.send("API çalışıyor 🚀");
});

// 🎬 CREATE VIDEO (SADECE ID)
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

    const videoId = data.guid;

    const playbackUrl = `https://${process.env.BUNNY_CDN_HOST}/${videoId}/playlist.m3u8`;

    res.json({
      videoId,
      playbackUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "create-video failed" });
  }
});

// 🔥🔥🔥 ASIL SİSTEM BURASI
app.post("/upload-optimized", upload.single("file"), async (req, res) => {
  try {
    const inputPath = req.file.path;
    const outputPath = `uploads/optimized_${Date.now()}.mp4`;

    // 🎯 FFmpeg optimize (Instagram/TikTok seviyesinde)
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          "-vf scale=-2:1920", // 1080p dikey
          "-c:v libx264",
          "-preset fast",
          "-crf 23",
          "-c:a aac",
          "-b:a 128k",
        ])
        .save(outputPath)
        .on("end", resolve)
        .on("error", reject);
    });

    // 🟢 Bunny video oluştur
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

    const createData = await createRes.json();
    const videoId = createData.guid;

    const uploadUrl = `https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos/${videoId}`;

    // 🔵 Bunny upload
    const fileBuffer = fs.readFileSync(outputPath);

    await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        AccessKey: process.env.BUNNY_API_KEY,
        "Content-Type": "application/octet-stream",
      },
      body: fileBuffer,
    });

    const playbackUrl = `https://${process.env.BUNNY_CDN_HOST}/${videoId}/playlist.m3u8`;

    // 🧹 temp temizle
    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);

    res.json({ playbackUrl });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ error: "upload failed" });
  }
});

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
