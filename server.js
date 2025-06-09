// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3000;

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

if (!REPLICATE_API_TOKEN) {
  console.error("⚠️ REPLICATE_API_TOKEN not set in environment variables!");
  process.exit(1);
}

app.use(cors());
app.use(bodyParser.json());

app.post('/generate', async (req, res) => {
  try {
    const { prompt, size = "1024x1024", style = "any" } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    // Créer la requête à Replicate
    const replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        Authorization: `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "recraft-ai/recraft-v3-svg:ac87d74dc2954575c4ffa152c5f793baea533f135764b5a567f74cbe3841cd2e",
        input: { prompt, size, style },
      }),
    });

    if (!replicateResponse.ok) {
      const errText = await replicateResponse.text();
      return res.status(500).json({ error: `Replicate API error: ${errText}` });
    }

    const prediction = await replicateResponse.json();

    // Polling pour attendre la fin du traitement
    let status = prediction.status;
    let output = null;

    while (status !== 'succeeded' && status !== 'failed') {
      await new Promise(r => setTimeout(r, 1000));
      const checkRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { Authorization: `Token ${REPLICATE_API_TOKEN}` },
      });
      const checkData = await checkRes.json();
      status = checkData.status;
      if (status === 'succeeded') output = checkData.output;
      if (status === 'failed') {
        return res.status(500).json({ error: 'Prediction failed' });
      }
    }

    res.json({ output });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
