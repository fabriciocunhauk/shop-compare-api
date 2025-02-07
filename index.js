import express from 'express';
const app = express();
const port = 3000;

app.use(express.json());

app.post('/ia', async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "llama3.2",
        prompt: prompt,
        stream: false
      }),
    });

    const data = await response.json();

    res.send(data.response);
  } catch (error) {
    console.error('Error generating response:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});