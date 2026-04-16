const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

// ROOT TEST (çok önemli)
app.get("/", (req, res) => {
  res.send("Backend çalışıyor 🚀");
});

// HEALTH CHECK (Railway için)
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Bunny video oluşturma
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
    res.status(500).json({ error: "Video oluşturulamadı" });
  }
});

// Fallback (kritik - Railway hatasını keser)
app.use((req, res) => {
  res.status(200).send("API çalışıyor");
});

// PORT (çok kritik)
const PORT = process.env.PORT;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});
