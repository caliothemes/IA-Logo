import express from "express";
import cors from "cors";
import Replicate from "replicate";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN, // Ton token dans .env
});

app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Le prompt est obligatoire." });

    const input = {
      seed: "-1",
      steps: "100",
      width: "256",
      height: "256",
      prompt: prompt,
      batch_size: "3", // ici 3 logos
      guidance_scale: "5",
      aesthetic_weight: 0.1,
    };

    const output = await replicate.run(
      "laion-ai/erlich:92fa143ccefeed01534d5d6648bd47796ef06847a6bc55c0e5c5b6975f2dcdfb",
      { input }
    );

    res.json({ output });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Erreur serveur" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
