import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.raw({ type: "*/*", limit: "500mb" }));

const PORT = process.env.PORT || 3000;

const BUNNY_API_KEY = process.env.BUNNY_API_KEY;
const LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;

app.get("/", (req, res) => {
  res.send("Backend çalışıyor 🚀");
});

// CREATE VIDEO
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
        body: JSON.stringify({ title }),
      }
    );

    const data = await response.json();

    res.json({
      videoId: data.guid,
      libraryId: LIBRARY_ID,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "create video hata" });
  }
});

// UPLOAD VIDEO
app.post("/upload-video", async (req, res) => {
  try {
    const { videoId, libraryId } = req.query;

    const uploadUrl = `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`;

    const bunnyRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        AccessKey: BUNNY_API_KEY,
        "Content-Type": "application/octet-stream",
      },
      body: req.body, // 🔥 BURASI ÇOK ÖNEMLİ
    });

    if (!bunnyRes.ok) {
      const text = await bunnyRes.text();
      console.log(text);
      return res.status(500).send("Upload hata");
    }

    res.send("OK");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.listen(PORT, () => {
  console.log("Server çalışıyor:", PORT);
});
