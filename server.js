import express from "express";
import cors from "cors";
//import fetch from "node-fetch";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ENV
const BUNNY_API_KEY = process.env.BUNNY_API_KEY;
const LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;

// TEST
app.get("/", (req, res) => {
  res.send("Backend çalışıyor 🚀");
});


// 🎯 1. VIDEO OLUŞTUR
app.post("/create-video", async (req, res) => {
  try {
    const { title } = req.body;

    const response = await fetch(
      `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos`,
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

    res.json({
      videoId: data.guid,
      libraryId: LIBRARY_ID,
    });
  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(500).send("create error");
  }
});


// 🔥 2. VIDEO UPLOAD (STREAM – EN KRİTİK)
app.post("/upload-video", async (req, res) => {
  try {
    const { videoId, libraryId } = req.query;

    if (!videoId || !libraryId) {
      return res.status(400).send("videoId / libraryId missing");
    }

    const uploadUrl = `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`;

    const bunnyRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        AccessKey: BUNNY_API_KEY,
        "Content-Type": "application/octet-stream",
      },
      body: req, // 🔥 STREAM DIRECT
    });

    if (!bunnyRes.ok) {
      const text = await bunnyRes.text();
      console.error("BUNNY ERROR:", text);
      return res.status(500).send(text);
    }

    res.send("OK");
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).send("upload error");
  }
});


// START
app.listen(PORT, () => {
  console.log("Server started on port", PORT);
});
