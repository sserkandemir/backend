
import express from "express";
import cors from "cors";
import crypto from "crypto";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const BUNNY_API_KEY = process.env.BUNNY_API_KEY;
const LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;

// 🔐 SIGNATURE ÜRET
function generateSignature(videoId, expires) {
  const raw = LIBRARY_ID + BUNNY_API_KEY + expires + videoId;
  return crypto.createHash("sha256").update(raw).digest("hex");
}

// TEST
app.get("/", (req, res) => {
  res.send("Backend çalışıyor 🚀");
});

// 🎯 CREATE + SIGNED UPLOAD DATA
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

    const videoId = data.guid;

    // ⏱️ 10 dk geçerli
    const expires = Math.floor(Date.now() / 1000) + 600;

    const signature = generateSignature(videoId, expires);

    res.json({
      videoId,
      libraryId: LIBRARY_ID,
      uploadUrl: `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos/${videoId}`,
      signature,
      expires,
    });

  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(500).send("create error");
  }
});

app.listen(PORT, () => {
  console.log("Server started on port", PORT);
});
