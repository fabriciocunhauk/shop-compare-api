import { normalizeProductName } from './utils/normalizer.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const morrisonsReceipt = fs.readFileSync(path.join(__dirname, 'debug_ocr.txt'), 'utf8');

const lines = morrisonsReceipt.split('\n');

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
  
  if (isIgnore) continue;

  let preCleaned = line;
  preCleaned = preCleaned.replace(/\b(\d+)['‘’?]?([HM])\b/gi, '$1 $2');
  preCleaned = preCleaned.replace(/^[a-z0-9\s‘'’\]\[()\\/|–—_~*#%]*?\b(\d+)\s+([A-Z])/g, '$1 $2');
  preCleaned = preCleaned.replace(/[£$]?\b\d+(?:\.\d{2})?\s+[£$](\d+\.\d{2})\b/g, '£$1');
  preCleaned = preCleaned.replace(/([£$]\d+),(\d{2})\d*\b/g, '$1.$2');

  const prices = [...preCleaned.matchAll(/(?:^|\s)[£]?(\d+\.\d{2})(?=\s|$|[A-Za-z]\s*$)/g)].map(m => m[1]);
  
  if (prices.length > 0) {
    let namePart = preCleaned;
    namePart = namePart.replace(/[£$]\s*\d+\.\d{2}(?:\s*[A-Z])?/gi, '').trim();
    namePart = namePart.replace(/\b\d+\.\d{2}\b/g, '').trim();

    let qty = 1;
    const codeMatch = namePart.match(/^[^A-Za-z0-9]*(\d+)\s+(.+)$/);
    if (codeMatch) {
      qty = parseInt(codeMatch[1], 10);
      namePart = codeMatch[2];
    }

    namePart = namePart.replace(/[^A-Za-z0-9)]+$/, '').trim();
    namePart = namePart.replace(/^[^A-Za-z0-9(]+/, '').trim();

    const normalizedName = normalizeProductName(namePart);
    const valid = normalizedName.length > 2 && /[A-Za-z]/.test(normalizedName);
    
    console.log(`${i+1}: Raw: "${line}"\n    -> namePart: "${namePart}"\n    -> Normalized: "${normalizedName}"\n    -> Valid: ${valid}`);
  }
}
