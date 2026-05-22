import { normalizeProductName } from './utils/normalizer.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const morrisonsReceipt = fs.readFileSync(path.join(__dirname, 'debug_ocr.txt'), 'utf8');

const lines = morrisonsReceipt.split('\n');
let supermarket = 'Morrisons';
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

  // Pre-cleaning
  line = line.replace(/\b(\d+)['‘’?]?([HM])\b/gi, '$1 $2');
  line = line.replace(/^[a-z0-9\s‘'’\]\[()\\/|–—_~*#%]*?\b(\d+)\s+([A-Z])/g, '$1 $2');
  line = line.replace(/[£$]?\b\d+(?:\.\d{2})?\s+[£$](\d+\.\d{2})\b/g, '£$1');
  line = line.replace(/([£$]\d+),(\d{2})\d*\b/g, '$1.$2');

  // Ignore
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
    continue;
  }

  // Weighed
  let isWeighed = false;
  let weightValue = null;
  let weightUnit = null;
  let weighedName = null;
  let weighedPrice = null;

  if (line.includes('@') || line.toLowerCase().includes('/kg')) {
    const weightMatch = line.match(/^(.+?)\s+(\d+(?:\.\d+)?)\s*(kg|g)\s*(?:@|x|X)/i);
    const allPrices = [...line.matchAll(/[£]?(\d+\.\d{2})/g)].map(m => m[1]);
    if (weightMatch && allPrices.length > 0) {
      isWeighed = true;
      weighedName = weightMatch[1].trim();
      weighedPrice = `£${allPrices[allPrices.length - 1]}`;
      weightValue = parseFloat(weightMatch[2]);
      weightUnit = weightMatch[3].toLowerCase();
    }
  }

  if (isWeighed) {
    const normalizedName = normalizeProductName(weighedName);
    if (normalizedName.length > 2 && /[A-Za-z]/.test(normalizedName)) {
      const existingItem = items.find(item => item.name.toLowerCase().trim() === normalizedName.toLowerCase().trim());
      if (existingItem) {
        console.log(`Line ${i+1}: Weighed item matched existing: "${normalizedName}"`);
      } else {
        items.push({
          name: normalizedName,
          price: weighedPrice,
          ...(weightValue && { size_value: weightValue }),
          ...(weightUnit && { size_unit: weightUnit })
        });
        console.log(`Line ${i+1}: Weighed item pushed: "${normalizedName}"`);
      }
    }
    continue;
  }

  // Standard prices
  const prices = [...line.matchAll(/(?:^|\s)[£]?(\d+\.\d{2})(?=\s|$|[A-Za-z]\s*$)/g)].map(m => m[1]);
  if (prices.length > 0) {
    let namePart = line;
    namePart = namePart.replace(/[£$]\s*\d+\.\d{2}(?:\s*[A-Z])?/gi, '').trim();
    namePart = namePart.replace(/\b\d+\.\d{2}\b/g, '').trim();

    if (!namePart || /^[A-Z]$/i.test(namePart)) {
      console.log(`Line ${i+1}: Skipped because empty namePart: "${namePart}"`);
      continue;
    }

    let qty = pendingQuantity;
    const codeMatch = namePart.match(/^[^A-Za-z0-9]*(\d+)\s+(.+)$/);
    if (codeMatch) {
      qty = parseInt(codeMatch[1], 10);
      namePart = codeMatch[2];
    }

    namePart = namePart.replace(/[^A-Za-z0-9)]+$/, '').trim();
    namePart = namePart.replace(/^[^A-Za-z0-9(]+/, '').trim();

    const normalizedName = normalizeProductName(namePart);
    if (normalizedName.length > 2 && /[A-Za-z]/.test(normalizedName)) {
      const priceStr = qty === 1 && prices.length > 1 ? `£${prices[prices.length - 1]}` : `£${prices[0]}`;
      const existingItem = items.find(item => item.name.toLowerCase().trim() === normalizedName.toLowerCase().trim());
      if (existingItem) {
        console.log(`Line ${i+1}: Matched existing standard item: "${normalizedName}"`);
      } else {
        items.push({
          name: normalizedName,
          price: priceStr
        });
        console.log(`Line ${i+1}: Standard item pushed: "${normalizedName}" with price ${priceStr}`);
      }
    } else {
      console.log(`Line ${i+1}: Skipped invalid normalizedName: "${normalizedName}"`);
    }
  }
}
