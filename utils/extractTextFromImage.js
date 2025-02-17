import { createWorker } from 'tesseract.js';

export  async function extractTextFromImage(image) {
  const worker = await createWorker('eng');

  const { data: { text } } = await worker.recognize(image); 

  await worker.terminate();
  return text.trim();
}