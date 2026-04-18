const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

/**
 * TEST
 */
app.get("/", (req, res) => {
  res.send("Backend çalışıyor 🚀");
});

/**
 * VIDEO OLUŞTUR
 */
app.post("/create-video", async (req, res) => {
  try {
    const response = await axios.post(
      'https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos',
      {
        title: "Test Video"
      },
      {
        headers: {
          AccessKey: process.env.BUNNY_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.log(error.response?.data || error.message);

    res.status(500).json({
      error: "Video oluşturulamadı",
      detail: error.response?.data || error.message
    });
  }
});

/**
 * UPLOAD URL AL
 */
app.post("/upload-video", (req, res) => {
  try {
    const { videoId } = req.body;

    if (!videoId) {
      return res.status(400).json({ error: "videoId gerekli" });
    }

    const uploadUrl = 'https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos/${videoId}';

    res.json({
      uploadUrl: uploadUrl,
      method: "PUT",
      message: "Bu URL'e video dosyasını PUT ile gönder"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * TEST VIDEO (browserdan denemek için)
 */
app.get("/test-video", async (req, res) => {
  try {
    const response = await axios.post(
      'https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos',
      {
        title: "Test Video Browser"
      },
      {
        headers: {
          AccessKey: process.env.BUNNY_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.log(error.response?.data || error.message);

    res.status(500).json({
      error: "Test video oluşturulamadı",
      detail: error.response?.data || error.message
    });
  }
});

/**
 * PORT
 */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
