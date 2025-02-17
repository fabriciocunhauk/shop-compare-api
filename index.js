import express from 'express';
import multer from 'multer';
import { deleteImage, getPriceList, insertImage, insertSupermarketData } from './database-postgres.js'; 
import cors from 'cors';
import { extractTextFromImage } from './extractTextFromImage.js';
import { parseExtractedText } from './parseExtractedText.js';

const app = express();
const port = 3333;
app.use(cors()); 
// helmet "Help secure Express apps by setting HTTP response headers."
app.use(helmet());

const storage = multer.memoryStorage();
const upload = multer({ storage }); 

app.post('/api/parse-receipt', upload.single('file'), async (req, res) => {
  try {
    const result = await insertImage(req.file.buffer); 

    const image = result[0].data;

    const extractedText = await extractTextFromImage(image);
    const parsedData = parseExtractedText(extractedText);

  for (const item of parsedData.items) {
    await insertSupermarketData(parsedData.supermarket, item.name, parseFloat( item.price.replace('£', '')));
  } 

    await deleteImage(result[0].id); 
    res.status(200).json(parsedData);
  } catch (error) {
    console.error("Error processing receipt:", error); 
    res.status(500).json({ error: 'An error occurred while processing the receipt.' });
  }
});

app.get('/api/price-list', async (req, res) => {
  try {
    const priceList = await getPriceList();

    res.status(200).json(priceList);
  } catch (error) {
    console.error("Error getting price list:", error); 
    res.status(500).json({ error: 'An error occurred while getting price list.' });
  }
});

app.listen({ host: '0.0.0.0', port: process.env.PORT ?? 3333 }, () => {
  console.log(`Server started on http://localhost:${port}`);
});