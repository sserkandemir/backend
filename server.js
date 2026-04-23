import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("API çalışıyor");
});

// CREATE VIDEO + RETURN UPLOAD URL
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

    const videoId = data.guid;

    // upload URL (en önemli kısım)
    const uploadUrl = `https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos/${videoId}`;

    res.json({
      videoId,
      uploadUrl,
      apiKey: process.env.BUNNY_API_KEY // frontend kullanacak
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "create failed" });
  }
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
