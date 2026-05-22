import { parseExtractedText } from './utils/parseExtractedText.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const morrisonsReceipt = fs.readFileSync(path.join(__dirname, 'debug_ocr.txt'), 'utf8');

const result = parseExtractedText(morrisonsReceipt);
console.log('Supermarket determined:', result.supermarket);
console.log(`Parsed ${result.items.length} items:`);
console.table(result.items);
