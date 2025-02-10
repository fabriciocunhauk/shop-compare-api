import express from 'express';
import multer from 'multer';
import { createWorker } from 'tesseract.js';
import { deleteImage, insertImage } from './database-postgres.js'; 

const app = express();
const port = 3333;

const storage = multer.memoryStorage();
const upload = multer({ storage }); 

app.post('/api/parse-receipt', upload.single('file'), async (req, res) => {
  try {
    const result = await insertImage(req.file.buffer); 

    const image = result[0].data;

    const extractedText = await extractTextFromImage(image);
    const parsedData = parseExtractedText(extractedText);

    await deleteImage(result[0].id); 
    res.status(200).json(parsedData);
  } catch (error) {
    console.error("Error processing receipt:", error); 
    res.status(500).json({ error: 'An error occurred while processing the receipt.' });
  }
});

async function extractTextFromImage(image) {
  const worker = await createWorker('eng');

  const { data: { text } } = await worker.recognize(image); 

  await worker.terminate();
  return text.trim();
}


function parseExtractedText(text) { 
  const lines = text.split('\n');
  const items = [];
  let supermarket = '';

  for (const line of lines) { 
    if (line.toLowerCase().includes('supermarket')) { 
      supermarket = line.replace(/^.*:/, "").trim(); 
    } else if (line.includes('£')) {
      const priceMatch = line.match(/£\d+\.\d+/);
      if (priceMatch) { 
        const price = priceMatch[0];
        const name = line.replace(/£\d+\.\d+/, "").trim();
        items.push({ name, price });
      }
    }
  }

  return { supermarket, items };
}

app.listen({ host: '0.0.0.0', port: process.env.PORT ?? 3333 }, () => {
  console.log(`Server started on http://localhost:${port}`);
});