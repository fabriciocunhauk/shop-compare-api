import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import bodyParser from 'body-parser';
import {
  createWorker
} from 'tesseract.js';
import {
  exec
} from 'child_process'; // Import exec for running Ollama CLI command

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

// Initialize upload variable
const upload = multer({
  storage: storage
});

// Create the uploads directory if it doesn't exist
const dir = './uploads';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

// Route to handle file upload
app.post('/api/parse-receipt', upload.single('file'), async (req, res) => {
  try {
    const imagePath = req.file.path; // Path to the uploaded image

    // Step 1: Use Tesseract.js to extract text from the image
    const extractedText = await extractTextFromImage(imagePath);

    // Step 2: Use Ollama to parse the extracted text
    const parsedData = await parseTextWithOllama(extractedText);

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

// Helper function: Extract text from the image using Tesseract.js
async function extractTextFromImage(imagePath) {
  const worker = await createWorker('eng');

  const {
    data: {
      text
    }
  } = await worker.recognize(imagePath); // Perform OCR
  await worker.terminate(); // Clean up resources

  return text.trim();
}

// Helper function: Parse text using Ollama
async function parseTextWithOllama(text) {
  const prompt = `Extract the supermarket name, product name and price from the receipt text:${text}`;

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

    // return data.response;
    return parseOllamaResponse(data.response);
  } catch (error) {
    console.error('Error generating response:', error);
    res.status(500).send('Internal Server Error');
  }
}

// Helper function: Parse Ollama's response into structured data
function parseOllamaResponse(response) {
  // Example parsing logic (customize based on Ollama's output format)
  const lines = response.split('\n');

  const items = [];
  let supermarket = '';

  lines.forEach(line => {
    console.log(line);
    
    if (line.includes('Supermarket')) {
      supermarket = line.replace('Supermarket', '').trim();
    } else if (line.includes('£')) {
      // Regular expression to match the price
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

// Start the server
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});