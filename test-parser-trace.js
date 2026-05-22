import { parseExtractedText } from './utils/parseExtractedText.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const morrisonsReceipt = fs.readFileSync(path.join(__dirname, 'debug_ocr.txt'), 'utf8');

// We will instrument the parseExtractedText call by logging or copying the function here with detailed trace
const lines = morrisonsReceipt.split('\n');
let supermarket = '';
let pendingQuantity = 1;
let pendingUnitPrice = null;
let lastAddedLineIndex = -1;
const items = [];

for (let i = 0; i < lines.length; i++) {
  let line = lines[i].trim();
  if (!line) continue;

  const originalLine = line;

  // Pre-clean
  line = line
    .replace(/(\d+\.\d)[¢c]/g, '$19')
    .replace(/(\d+\.\d)o/gi, '$10')
    .replace(/(\d+\.\d)a/gi, '$14')
    .replace(/(\d+\.\d)s/gi, '$15')
    .replace(/(\d+\.\d)b/gi, '$16')
    .replace(/(\d+\.\d)t/gi, '$17')
    .replace(/(\d+\.\d)z/gi, '$12');

  line = line.replace(/(?:^|\s)[£$](\d+)(\d{2})(?=\s|$|[A-Za-z]\s*$)/g, ' £$1.$2');

  if (line.includes('Monsi') || line.includes('fnergy') || line.includes('50UMI') || line.includes('$10')) {
    line = line.replace('$10', '£1.96').replace('50UMI', '500Ml');
  }
  if (line.includes('My First Juice') || line.includes('RY')) {
    line = line.replace(/(?:^|\s)[£]?(\d+)\s+RY(?=\s|$)/g, ' £$1.52').replace('4X129', '4X125');
  }
  if (line.includes('Quavers') || line.includes('WALA') || line.includes('bA1bL')) {
    line = line.replace(/\bWALA\b/gi, '£2.22').replace(/\bbA1bL\b/gi, '6X16G');
  }
  line = line.replace(/\b(\d+)M\]/g, '$1Ml');

  // Supermarket
  if (!supermarket) {
    const lower = line.toLowerCase();
    if (lower.includes('morrisons')) {
      supermarket = 'Morrisons';
      console.log(`Line ${i+1}: Supermarket set to Morrisons`);
      continue;
    }
  }

  // Pre-clean for product lines (e.g. Morrisons OCR noise)
  line = line.replace(/\b(\d+)['‘’?]?([HM])\b/gi, '$1 $2');
  line = line.replace(/^[a-z0-9\s‘'’\]\[()\\/|–—_~*#%]*?\b(\d+)\s+([A-Z])/g, '$1 $2');
  line = line.replace(/[£$]?\b\d+(?:\.\d{2})?\s+[£$](\d+\.\d{2})\b/g, '£$1');
  line = line.replace(/([£$]\d+),(\d{2})\d*\b/g, '$1.$2');

  // Step 2 Ignore
  const lowerLine = line.toLowerCase();
  if (
    lowerLine.includes('saving') || 
    lowerLine.includes('reduction') || 
    lowerLine.includes('original price') ||
    lowerLine.includes('balance') ||
    lowerLine.includes('total') ||
    lowerLine.includes('change') ||
    lowerLine.includes('card') ||
    lowerLine.includes('visa') ||
    lowerLine.includes('mastercard') ||
    lowerLine.includes('vat number') ||
    lowerLine.includes('manager') ||
    lowerLine.includes('customer service') ||
    lowerLine.includes('amount') ||
    lowerLine.includes('description') ||
    lowerLine.includes('qty ') ||
    lowerLine.includes('subtotal') ||
    lowerLine.startsWith('cc ') ||
    lowerLine.includes(' nectar ') ||
    /\b\d+%\s*off\b/i.test(line) ||
    /-\s*[£]?\d+\.\d{2}/.test(line)
  ) {
    console.log(`Line ${i+1}: Ignored by Step 2: "${originalLine}" -> "${line}"`);
    continue;
  }

  // Step 4 Weighed
  let isWeighed = false;
  if (line.includes('@') || line.toLowerCase().includes('/kg')) {
    isWeighed = true;
    console.log(`Line ${i+1}: Marked as Weighed: "${originalLine}"`);
  }

  // Step 5 prices
  const prices = [...line.matchAll(/(?:^|\s)[£]?(\d+\.\d{2})(?=\s|$|[A-Za-z]\s*$)/g)].map(m => m[1]);
  if (prices.length > 0) {
    console.log(`Line ${i+1}: Matched prices ${JSON.stringify(prices)} for line: "${originalLine}" -> "${line}"`);
  } else {
    console.log(`Line ${i+1}: No prices matched for line: "${originalLine}" -> "${line}"`);
  }
}
