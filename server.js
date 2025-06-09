import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();

app.use(cors());
app.use(express.json());

const REPLICATE_TOKEN = "r8_djQNMobvbOFxoO494K8ITy5FRomEsu509jlzW";
const MODEL_VERSION = "f46c8c2063ba7b07ed1a220e5e852dd4ecce13f1aaac1fd4f2891313e31b9110";

app.post('/generate', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    // Crée la prédiction sur Replicate
    const createResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${REPLICATE_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        version: MODEL_VERSION,
        input: { prompt }
      })
    });

    const prediction = await createResponse.json();

    if (!prediction.id) {
      return res.status(500).json({ error: "Erreur lors de la création de la prédiction", details: prediction });
    }

    // Poll pour la fin de la génération
    let status = prediction.status;
    let output = null;
    while (status !== "succeeded" && status !== "failed") {
      await new Promise(r => setTimeout(r, 2500));
      const statusRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          "Authorization": `Token ${REPLICATE_TOKEN}`
        }
      });
      const statusJson = await statusRes.json();
      status = statusJson.status;
      if (status === "succeeded") {
        output = statusJson.output;
      }
      if (status === "failed") {
        return res.status(500).json({ error: "La génération a échoué" });
      }
    }

    res.json({ output });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Serveur prêt sur le port ${PORT}`);
});
