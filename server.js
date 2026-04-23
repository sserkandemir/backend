import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json({ limit: "100mb" }));

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("API çalışıyor");
});

// CREATE VIDEO
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
          title: "video",
        }),
      }
    );

    const data = await response.json();

    res.json({
      videoId: data.guid,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "create failed" });
  }
});

// UPLOAD VIDEO
app.post("/upload-video", async (req, res) => {
  try {
    const { videoId, fileBase64 } = req.body;

    const buffer = Buffer.from(fileBase64, "base64");

    const response = await fetch(
      `https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos/${videoId}`,
      {
        method: "PUT",
        headers: {
          AccessKey: process.env.BUNNY_API_KEY,
          "Content-Type": "application/octet-stream",
        },
        body: buffer,
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).json({ error: text });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "upload failed" });
  }
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
