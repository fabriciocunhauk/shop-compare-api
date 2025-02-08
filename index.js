import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import bodyParser from 'body-parser';
import {createWorker} from 'tesseract.js';

const app = express();
app.use(bodyParser.json());
const port = 3000;

// Set up storage engine for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Specify the directory where files will be stored
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Rename the file to avoid name conflicts
  }
});

const upload = multer({
  storage: storage
});

// Create the uploads directory if it doesn't exist
const dir = './uploads';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

app.post('/api/parse-receipt', upload.single('file'), async (req, res) => {
  try {
    const imagePath = req.file.path; // Path to the uploaded image

    // Step 1: Use Tesseract.js to extract text from the image
    const extractedText = await extractTextFromImage(imagePath);

    // Step 2: Parse the extracted text
    const parsedData =  parseExtractedText(extractedText);

    // Delete the image from the uploads folder
    fs.unlinkSync(imagePath);

    // Step 3: Return the parsed data to the frontend
    res.status(200).json(parsedData);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'An error occurred while processing the receipt.'
    });
  }
});

async function extractTextFromImage(imagePath) {
  const worker = await createWorker('eng');

  const {
    data: {
      text
    }
  } = await worker.recognize(imagePath); 
  await worker.terminate(); 

  return text.trim();
}

function parseExtractedText(response) {
  const lines = response.split('\n');

  const items = [];
  let supermarket = '';

  lines.forEach(line => {
    console.log(line);
    
    if (line.includes('Supermarket')) {
      supermarket = line.replace(/^.*:/, "").trim();
    } else if (line.includes('£')) {
      const priceMatch = line.match(/£\d+\.\d+/); 
      const price = priceMatch[0];

      const name = line.replace(/£\d+\.\d+/, "").trim();

      items.push({
        name,
        price
      });
    }
  });

  return {
    supermarket,
    items,
  };
}

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});