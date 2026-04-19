import express from "express";
import cors from "cors";

const app = express();

app.use(cors());

// ❗ SADECE create-video için json parser
app.post("/create-video", express.json(), async (req, res) => {
  try {
    const { title } = req.body;

    const response = await fetch(
      `https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos`,
      {
        method: "POST",
        headers: {
          AccessKey: process.env.BUNNY_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      }
    );

    const data = await response.json();

    res.json({
      videoId: data.guid,
      libraryId: process.env.BUNNY_LIBRARY_ID,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("create video hata");
  }
});

// 🚨 BURASI KRİTİK — BODY PARSER YOK
app.post("/upload-video", async (req, res) => {
  try {
    const { videoId, libraryId } = req.query;

    const uploadUrl = `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`;

    const bunnyRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        AccessKey: process.env.BUNNY_API_KEY,
        "Content-Type": "application/octet-stream",
      },
      body: req,          // 🔥 STREAM DIRECT
      duplex: "half",     // 🔥 ÇOK ÖNEMLİ
    });

    if (!bunnyRes.ok) {
      const text = await bunnyRes.text();
      console.log("BUNNY ERROR:", text);
      return res.status(500).send("Upload hata");
    }

    res.send("OK");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.get("/", (req, res) => {
  res.send("Backend çalışıyor 🚀");
});

app.listen(process.env.PORT || 3000);
