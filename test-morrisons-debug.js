import { parseExtractedText } from './utils/parseExtractedText.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const morrisonsReceipt = fs.readFileSync(path.join(__dirname, 'debug_ocr.txt'), 'utf8');

const lines = morrisonsReceipt.split('\n');
console.log('Line-by-line breakdown:');
for (let i = 0; i < lines.length; i++) {
  const rawLine = lines[i].trim();
  if (!rawLine) continue;
  
  // Let's run a mini parse on this single line
  const result = parseExtractedText(rawLine);
  console.log(`${i+1}: Raw: "${rawLine}" -> Supermarket: ${result.supermarket}, Items count: ${result.items.length}`);
  if (result.items.length > 0) {
    console.log('   Parsed Item:', JSON.stringify(result.items[0]));
  }
}
