const express = require('express');
const fetch = require('node-fetch'); // si node 18+, tu peux utiliser fetch natif
const app = express();

app.use(express.json());

const replicateToken = "r8_djQNMobvbOFxoO494K8ITy5FRomEsu509jlzW";

app.post('/generate-logo', async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${replicateToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        version: "f46c8c2063ba7b07ed1a220e5e852dd4ecce13f1aaac1fd4f2891313e31b9110",
        input: { prompt }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).send(errorText);
    }

    const prediction = await response.json();

    res.json(prediction);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server ready on port ${PORT}`);
});

