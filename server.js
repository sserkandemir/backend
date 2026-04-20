import express from "express";
import cors from "cors";

const app = express();

// 🔥 CORS
app.use(cors());

// 🔥 EN KRİTİK: RAW BODY (UPLOAD İÇİN)
app.use(express.raw({
  type: "/",
  limit: "500mb"
}));

// 🔥 JSON (create-video için)
app.use(express.json());

const PORT = process.env.PORT || 3000;

const BUNNY_API_KEY = process.env.BUNNY_API_KEY;
const LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;

// ✅ TEST
app.get("/", (req, res) => {
  res.send("Backend çalışıyor 🚀");
});


// =============================
// 🎬 CREATE VIDEO
// =============================
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
    console.error("CREATE ERROR:", err);
    res.status(500).json({ error: "create video hata" });
  }
});


// =============================
// 🚀 UPLOAD VIDEO (KRİTİK)
// =============================
app.post("/upload-video", async (req, res) => {
  try {
    const { videoId, libraryId } = req.query;

    // 🔥 DEBUG
    console.log("VIDEO ID:", videoId);
    console.log("BODY LENGTH:", req.body?.length);

    if (!req.body || req.body.length === 0) {
      return res.status(400).send("Video boş geldi");
    }

    const uploadUrl = `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`;

    const bunnyRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        AccessKey: BUNNY_API_KEY,
        "Content-Type": "application/octet-stream",
      },
      body: req.body,
    });

    // 🔥 Bunny response debug
    const text = await bunnyRes.text();
    console.log("BUNNY RESPONSE:", text);

    if (!bunnyRes.ok) {
      return res.status(500).send(text);
    }

    res.send("OK");

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).send("Server error");
  }
});


// =============================
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
