const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

// TEST
app.get("/", (req, res) => {
  res.send("Backend çalışıyor 🚀");
});

// TEST VIDEO
app.get("/test-video", async (req, res) => {
  try {
    const response = await axios.post(
      "https://video.bunnycdn.com/library/638826/videos", // BURAYA KENDİ ID
      {
        title: "Test Video"
      },
      {
        headers: {
          AccessKey: "fabe0246-85e2-443b-9ce779457106-1949-40fb", // BURAYA API KEY
          "Content-Type": "application/json"
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.log(error.response?.data || error.message);
    res.status(500).json({
      error: "Hata oluştu",
      detail: error.response?.data || error.message
    });
  }
});

// PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
