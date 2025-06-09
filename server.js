require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/generate', async (req, res) => {
  const { prompt } = req.body;

  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      version: "cf93cf55cf5651e3888f45d61886ff3b1e678c82002448ec2cf58c07c990f463",
      input: { prompt }
    })
  });

  const data = await response.json();
  res.json(data);
});

app.listen(PORT, () => console.log(`🚀 Server ready at http://localhost:${PORT}`));
