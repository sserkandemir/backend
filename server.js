import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || 3000;

// 🔥 BUNNY ENV
const BUNNY_API_KEY = process.env.BUNNY_API_KEY;
const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;
const BUNNY_CDN_HOST = process.env.BUNNY_CDN_HOST; 
// örnek: vz-12345.b-cdn.net

// -----------------------------
// 1️⃣ CREATE VIDEO
// -----------------------------
app.post("/create-video", async (req, res) => {
  try {
    const { title } = req.body;

    const response = await fetch(
      `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos`,
      {
        method: "POST",
        headers: {
          AccessKey: BUNNY_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title || "video",
        }),
      }
    );

    const data = await response.json();

    return res.json({
      videoId: data.guid,
      libraryId: BUNNY_LIBRARY_ID,
      playUrl: `https://${BUNNY_CDN_HOST}/${data.guid}/playlist.m3u8`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "create-video error" });
  }
});

// -----------------------------
// 2️⃣ UPLOAD VIDEO
// -----------------------------
app.post("/upload-video", async (req, res) => {
  try {
    const { videoId, libraryId } = req.query;

    const uploadUrl = `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`;

    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        AccessKey: BUNNY_API_KEY,
        "Content-Type": "application/octet-stream",
      },
      body: req,
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).json({ error: text });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "upload-video error" });
  }
});

// -----------------------------
// HEALTH CHECK
// -----------------------------
app.get("/", (req, res) => {
  res.send("Backend çalışıyor 🚀");
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
