import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

const BUNNY_API_KEY = process.env.BUNNY_API_KEY;
const LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;

app.get("/", (req, res) => {
  res.send("Backend çalışıyor 🚀");
});


// CREATE VIDEO
app.post("/create-video", express.json(), async (req, res) => {
  try {
    const { title } = req.body;

    const response = await axios.post(
      `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos`,
      { title: title || "video" },
      {
        headers: {
          AccessKey: BUNNY_API_KEY,
        },
      }
    );

    res.json({
      videoId: response.data.guid,
      libraryId: LIBRARY_ID,
    });

  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).send("create error");
  }
});


// 🔥 UPLOAD (EN KRİTİK FIX)
app.post("/upload-video", async (req, res) => {
  try {
    const { videoId, libraryId } = req.query;

    if (!videoId || !libraryId) {
      return res.status(400).send("missing params");
    }

    const url = `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`;

    const response = await axios({
      method: "put",
      url,
      headers: {
        AccessKey: BUNNY_API_KEY,
        "Content-Type": "application/octet-stream",
      },
      data: req, // 🔥 stream
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    res.send("OK");

  } catch (err) {
    console.error("UPLOAD ERROR:", err.response?.data || err.message);
    res.status(500).send(err.response?.data || "upload error");
  }
});

app.listen(PORT, () => {
  console.log("Server started:", PORT);
});
