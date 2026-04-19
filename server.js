const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend çalışıyor 🚀");
});

/**
 * VIDEO OLUŞTUR
 */
app.post("/create-video", async (req, res) => {
  try {
    const response = await axios.post(
      `https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos`,
      {
        title: req.body.title || "Video"
      },
      {
        headers: {
          AccessKey: process.env.BUNNY_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({
      videoId: response.data.guid,
      libraryId: process.env.BUNNY_LIBRARY_ID
    });

  } catch (error) {
    console.log(error.response?.data || error.message);

    res.status(500).json({
      error: "Video oluşturulamadı",
      detail: error.response?.data || error.message
    });
  }
});

/**
 * 🔥 GERÇEK UPLOAD (EN KRİTİK KISIM)
 */
app.post("/upload-video", async (req, res) => {
  try {
    const { videoId, libraryId } = req.query;

    if (!videoId || !libraryId) {
      return res.status(400).send("videoId ve libraryId gerekli");
    }

    const chunks = [];

    req.on("data", chunk => chunks.push(chunk));

    req.on("end", async () => {
      const buffer = Buffer.concat(chunks);

      try {
        await axios.put(
          `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
          buffer,
          {
            headers: {
              AccessKey: process.env.BUNNY_API_KEY,
              "Content-Type": "application/octet-stream"
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
          }
        );

        res.send("Upload başarılı 🚀");

      } catch (err) {
        console.log(err.response?.data || err.message);
        res.status(500).send("Bunny upload hatası");
      }
    });

  } catch (error) {
    res.status(500).send(error.message);
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
