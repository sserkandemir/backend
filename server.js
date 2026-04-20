import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

const BUNNY_API_KEY = process.env.BUNNY_API_KEY;
const LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;

// TEST
app.get("/", (req, res) => {
  res.send("Backend çalışıyor 🚀");
});


// 🎯 VIDEO CREATE
app.post("/create-video", express.json(), async (req, res) => {
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
        body: JSON.stringify({ title: title || "video" }),
      }
    );

    const data = await response.json();

    res.json({
      videoId: data.guid,
      libraryId: LIBRARY_ID,
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("create error");
  }
});


// 🔥 STREAM UPLOAD (KRİTİK)
app.post("/upload-video", async (req, res) => {
  try {
    const { videoId, libraryId } = req.query;

    if (!videoId || !libraryId) {
      return res.status(400).send("missing params");
    }

    const bunnyRes = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
      {
        method: "PUT",
        headers: {
          AccessKey: BUNNY_API_KEY,
          "Content-Type": "application/octet-stream",
        },
        body: req, // 🔥 STREAM PIPE
      }
    );

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


app.listen(PORT, () => {
  console.log("Server started:", PORT);
});
