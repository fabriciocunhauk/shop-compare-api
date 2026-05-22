import { parseExtractedText } from './utils/parseExtractedText.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const morrisonsReceipt = fs.readFileSync(path.join(__dirname, 'debug_ocr.txt'), 'utf8');

const lines = morrisonsReceipt.split('\n');
console.log('Detailed Morrisons Parsing Analysis:');
for (let i = 0; i < lines.length; i++) {
  let line = lines[i].trim();
  if (!line) continue;

  const lowerLine = line.toLowerCase();
  const isIgnore = lowerLine.includes('saving') || 
                   lowerLine.includes('reduction') || 
                   lowerLine.includes('total') || 
                   lowerLine.includes('change') || 
                   lowerLine.includes('card') ||
                   lowerLine.includes('vat number') ||
                   lowerLine.includes('manager') ||
                   lowerLine.includes('customer service') ||
                   lowerLine.includes('description');
  
  if (isIgnore) {
    console.log(`${i+1}: IGNORED (header/footer/meta): "${line}"`);
    continue;
  }

  // Run the pre-cleaning steps
  let preCleaned = line;
  preCleaned = preCleaned.replace(/\b(\d+)['‘’?]?([HM])\b/gi, '$1 $2');
  preCleaned = preCleaned.replace(/^[a-z0-9\s‘'’\]\[()\\/|–—_~*#%]*?\b(\d+)\s+([A-Z])/g, '$1 $2');
  preCleaned = preCleaned.replace(/[£$]?\b\d+(?:\.\d{2})?\s+[£$](\d+\.\d{2})\b/g, '£$1');
  preCleaned = preCleaned.replace(/([£$]\d+),(\d{2})\d*\b/g, '$1.$2');

  const prices = [...preCleaned.matchAll(/(?:^|\s)[£]?(\d+\.\d{2})(?=\s|$|[A-Za-z]\s*$)/g)].map(m => m[1]);
  
  if (prices.length === 0) {
    console.log(`${i+1}: SKIPPED (No prices matched): Raw: "${line}" -> Pre-cleaned: "${preCleaned}"`);
  } else {
    console.log(`${i+1}: MATCHED: Raw: "${line}" -> Pre-cleaned: "${preCleaned}" -> Prices: ${JSON.stringify(prices)}`);
  }
}
