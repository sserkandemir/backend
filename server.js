const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend çalışıyor 🚀");
});

app.get("/test-video", async (req, res) => {
  try {
    const libraryId = "638826"; // BURAYI DEĞİŞTİR

    const url = 'https://video.bunnycdn.com/library/${libraryId}/videos';

    const response = await axios.post(
      url,
      {
        title: "Test Video"
      },
      {
        headers: {
          AccessKey: "fabe0246-85e2-443b-9ce779457106-1949-40fb", // BURAYI DA DEĞİŞTİR
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
});

app.listen(3000);
