const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

/*
====================================
✅ TEST (tarayıcıdan kontrol)
====================================
*/
app.get("/", (req, res) => {
  res.send("Backend çalışıyor 🚀");
});

/*
====================================
✅ BUNNY VIDEO CREATE (POST)
====================================
*/
app.post("/create-video", async (req, res) => {
  try {
    const response = await axios.post(
      'https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos',
      {},
      {
        headers: {
          AccessKey: process.env.BUNNY_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({
      error: "Video oluşturulamadı",
      detay: error.response?.data || error.message,
    });
  }
});

/*
====================================
✅ TARAYICIDAN TEST (EN ÖNEMLİ)
====================================
*/
app.get("/test-video", async (req, res) => {
  try {
    const response = await axios.post(
      'https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos',
      {},
      {
        headers: {
          AccessKey: process.env.BUNNY_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({
      error: "Test video oluşturulamadı",
      detay: error.response?.data || error.message,
    });
  }
});

/*
====================================
✅ PORT (RAILWAY İÇİN KRİTİK)
====================================
*/
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
