import express from "express";
import multer from "multer";
import axios from "axios";
import fs from "fs";
import cors from "cors";

const app = express();
app.use(cors());

const upload = multer({ dest: "uploads/" });

app.post("/upload-video", upload.single("video"), async (req, res) => {
  try {
    const file = req.file;

    const response = await axios.post(
      https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos,
      { title: "video" },
      {
        headers: {
          AccessKey: process.env.BUNNY_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const videoId = response.data.guid;

    await axios.put(
      https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos/${videoId},
      fs.createReadStream(file.path),
      {
        headers: {
          AccessKey: process.env.BUNNY_API_KEY,
          "Content-Type": "application/octet-stream",
        },
      }
    );

    fs.unlinkSync(file.path);

    res.json({
      videoId,
      url: https://iframe.mediadelivery.net/play/${process.env.BUNNY_LIBRARY_ID}/${videoId},
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "upload failed" });
  }
});

app.listen(3000, () => console.log("Server running"));
