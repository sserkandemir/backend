import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("API çalışıyor");
});

// VIDEO CREATE
app.post("/create-video", async (req, res) => {
  try {
    const response = await fetch("https://video.bunnycdn.com/library/" + process.env.BUNNY_LIBRARY_ID + "/videos", {
      method: "POST",
      headers: {
        "AccessKey": process.env.BUNNY_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: req.body.title || "video"
      })
    });

    const data = await response.json();

    res.json({
      videoId: data.guid,
      libraryId: process.env.BUNNY_LIBRARY_ID
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "create failed" });
  }
});

// UPLOAD
app.post("/upload-video", (req, res) => {
  res.send("upload endpoint ok");
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
