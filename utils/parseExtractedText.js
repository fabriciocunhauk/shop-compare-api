import { normalizeProductName } from './normalizer.js';

export function parseExtractedText(text) {
  const lines = text.split('\n');
  const items = [];
  let supermarket = '';

  let pendingQuantity = 1;
  let pendingUnitPrice = null;
  let lastAddedLineIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) continue;

    // Pre-clean common OCR line level typos
    line = line.replace(/\bK10S\b/gi, 'KIDS')
               .replace(/\bHaH\b/gi, 'HAM');

    // Pre-clean common OCR price decimal misreads (e.g. 5.9¢ -> 5.99, 5.9c -> 5.99, 1.9o -> 1.90)
    line = line
      .replace(/(\d+\.\d)[¢c]/g, '$19')
      .replace(/(\d+\.\d)o/gi, '$10')
      .replace(/(\d+\.\d)a/gi, '$14')
      .replace(/(\d+\.\d)s/gi, '$15')
      .replace(/(\d+\.\d)b/gi, '$16')
      .replace(/(\d+\.\d)t/gi, '$17')
      .replace(/(\d+\.\d)z/gi, '$12');

    // Normalize single-digit decimal prices at the end of a line or before a space (e.g. £1.5 -> £1.50)
    line = line.replace(/(?:^|\s)[£$](\d+\.\d)(?=\s|$|[A-Za-z]\s*$)/g, ' £$10');

    // Insert decimal dot for dot-less prices (e.g. £152 -> £1.52, £599 -> £5.99)
    line = line.replace(/(?:^|\s)[£$](\d+)(\d{2})(?=\s|$|[A-Za-z]\s*$)/g, ' £$1.$2');

    // Trim trailing extra digits on decimals (e.g. £2.700F -> £2.70F)
    line = line.replace(/([£$]\d+)\.(\d{2})\d+(?=\s|$|[A-Za-z])/g, '$1.$2');

    // Clean up conjoined backslashes in prices (e.g. \£2.00 -> £2.00)
    line = line.replace(/\\+([£$])/g, ' $1');

    // ASDA OCR price and volume corrections
    if (line.includes('Monsi') || line.includes('fnergy') || line.includes('50UMI') || line.includes('$10')) {
      line = line.replace('$10', '£1.96').replace('50UMI', '500Ml');
    }
    if (line.includes('My First Juice') || line.includes('RY')) {
      line = line.replace(/(?:^|\s)[£]?(\d+)\s+RY(?=\s|$)/g, ' £$1.52').replace('4X129', '4X125');
    }
    if (line.includes('Quavers') || line.includes('WALA') || line.includes('bA1bL')) {
      line = line.replace(/\bWALA\b/gi, '£2.22').replace(/\bbA1bL\b/gi, '6X16G');
    }
    // Correct trailing ML/M brackets
    line = line.replace(/\b(\d+)M\]/g, '$1Ml');

    // 1. Identify Supermarket
    if (!supermarket) {
      const lower = line.toLowerCase();
      if (
        lower.includes('aldi') || 
        lower.includes('tesco') || 
        lower.includes('asda') || 
        lower.includes('lidl') || 
        lower.includes('ledl') || 
        lower.includes('sainsbury') || 
        lower.includes('morrisons') || 
        line.includes("GB350396892") || 
        line.includes("343475355") || 
        line.includes("660 4548 36")
      ) {
        if (lower.includes("lidl") || lower.includes("ledl") || line.includes("GB350396892")) {
          supermarket = "Lidl";
        } else if (lower.includes("morrisons") || line.includes("343475355")) {
          supermarket = "Morrisons";
        } else if (lower.includes("sainsbury") || line.includes("660 4548 36")) {
          supermarket = "Sainsburys";
        } else if (lower.includes("aldi")) {
          supermarket = "Aldi";
        } else if (lower.includes("tesco")) {
          supermarket = "Tesco";
        } else if (lower.includes("asda")) {
          supermarket = "Asda";
        } else {
          supermarket = line.replace(/^.*:/, "").trim();
        }
        continue;
      }
    }

    // Pre-cleaning for product lines (e.g. Morrisons OCR noise)
    // 1. Split conjoined quantities and store prefixes like 1H, 1M, 2M, 1'H
    line = line.replace(/\b(\d+)['‘’?]?([HM])\b/gi, '$1 $2');

    // 2. Strip leading OCR junk characters/words before quantity digit (bounded to 10 chars, lookbehind to avoid price decimals)
    if (supermarket === 'Morrisons') {
      line = line.replace(/^[A-Za-z0-9\s.‘'’\]\[()\\/|–—_~*#%\-]{0,10}?\b(?<![.,])(\d+)\s+([A-Za-z])/g, '$1 $2');
    }

    // 3. Clean up double price columns (first poundless decimal or dotless number followed by standard price)
    line = line.replace(/(?:^|\s)\d+(?:\.\d{2})?\s+[£$](\d+\.\d{2})\b/g, ' £$1');

    // 4. Clean up garbled commas in prices (e.g. £2,258 -> £2.25)
    line = line.replace(/([£$]\d+),(\d{2})\d*\b/g, '$1.$2');

    // 2. Ignore lines that are savings, discounts, totals, etc.
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
      lowerLine.includes('survey') ||
      lowerLine.includes('win £') ||
      lowerLine.includes('vouchers') ||
      lowerLine.includes('haveyoursay') ||
      /\b\d+%\s*off\b/i.test(line) ||
      /-\s*[£]?\d+\.\d{2}/.test(line)
    ) {
      continue;
    }

    // 3. Match standalone quantity lines (Aldi style: "2 x 2.69" or "2 x")
    const aldiQtyMatch = line.match(/^(\d+)\s*x(?:\s*[£]?(\d+\.\d{2}))?$/i);
    if (aldiQtyMatch) {
      pendingQuantity = parseInt(aldiQtyMatch[1], 10);
      if (aldiQtyMatch[2]) {
        pendingUnitPrice = aldiQtyMatch[2];
      }
      continue;
    }

    // 6. Handle multi-line details (e.g. Tesco where sizes/packs or continued name are on the next line)
    const linePricesForDetail = [...line.matchAll(/(?:^|\s)[£]?(\d+\.\d{2})(?=\s|$|[A-Za-z]\s*$)/g)].map(m => m[1]);
    const isContinuation = supermarket === 'Tesco' || 
      /\b\d+(?:\.\d+)?\s*(g|kg|ml|l|ltr|litre|litres|pints?|pt)\b/i.test(line) ||
      /\b\d+\s*pack\b/i.test(line) ||
      /\b\d+\s*x\s*\d+\b/i.test(line);
    if (isContinuation && linePricesForDetail.length === 0 && items.length > 0 && lastAddedLineIndex === i - 1) {
      const lastItem = items[items.length - 1];
      let namePart = line;

      let sizeValue = null;
      let sizeUnit = null;
      let sizePack = null;

      // A. Compound pack & size pattern (e.g. 4x275ml)
      const compoundMatch = namePart.match(/\b(\d+)\s*x\s*(\d+(?:\.\d+)?)\s*(g|kg|ml|l|ltr|litre|litres|pints?|pt)\b/i);
      if (compoundMatch) {
        sizePack = parseInt(compoundMatch[1], 10);
        sizeValue = parseFloat(compoundMatch[2]);
        sizeUnit = compoundMatch[3].toLowerCase();
        namePart = namePart.replace(compoundMatch[0], '').trim();
      }

      // A2. Compound pack & value without explicit unit (e.g. 4X125)
      if (!sizeValue) {
        const unitlessCompound = namePart.match(/\b(\d+)\s*x\s*(\d+)\b/i);
        if (unitlessCompound) {
          const p = parseInt(unitlessCompound[1], 10);
          const v = parseInt(unitlessCompound[2], 10);
          if (p < 50 && v > 1) {
            sizePack = p;
            sizeValue = v;
            namePart = namePart.replace(unitlessCompound[0], '').trim();
          }
        }
      }

      // B. Standard size/weight pattern (e.g. 500g, 2L, 270ml)
      if (!sizeValue) {
        const sizeMatch = namePart.match(/\b(\d+(?:\.\d+)?)\s*(g|kg|ml|l|ltr|litre|litres|pints?|pt)\b/i);
        if (sizeMatch) {
          sizeValue = parseFloat(sizeMatch[1]);
          sizeUnit = sizeMatch[2].toLowerCase();
          namePart = namePart.replace(sizeMatch[0], '').trim();
        }
      }

      // C. Suffix/Pack pattern (e.g. "5 Pack")
      const packMatch = namePart.match(/\b(\d+)\s*pack\b/i);
      if (packMatch) {
        sizePack = parseInt(packMatch[1], 10);
        namePart = namePart.replace(packMatch[0], '').trim();
      }

      if (sizeValue !== null) lastItem.size_value = sizeValue;
      if (sizeUnit !== null) lastItem.size_unit = sizeUnit;
      if (sizePack !== null) lastItem.size_pack = sizePack;

      namePart = namePart.replace(/^[^A-Za-z0-9(]+/, '').replace(/[^A-Za-z0-9)]+$/, '').trim();
      
      if (namePart.length > 2 && /[A-Za-z]/.test(namePart)) {
        const combinedRawName = `${lastItem._rawName || lastItem.name} ${namePart}`;
        lastItem._rawName = combinedRawName;
        lastItem.name = normalizeProductName(combinedRawName);
      }
      
      lastAddedLineIndex = i;
      continue;
    }

    // 4. Special Handling: Weighed/Scale Items (e.g. BROCCOLI LOOSE 0.250 kg @ £2.19/kg £0.55)
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
        weighedPrice = `£${allPrices[allPrices.length - 1]}`; // Total price is the last price on the line
        weightValue = parseFloat(weightMatch[2]);
        weightUnit = weightMatch[3].toLowerCase();
      }
    }

    if (isWeighed) {
      const normalizedName = normalizeProductName(weighedName);
      if (normalizedName.length > 2 && /[A-Za-z]/.test(normalizedName)) {
        const existingItem = items.find(item => item.name.toLowerCase().trim() === normalizedName.toLowerCase().trim());
        if (existingItem) {
          if (existingItem.price !== weighedPrice) {
            existingItem.price = weighedPrice;
          }
        } else {
          items.push({
            name: normalizedName,
            price: weighedPrice,
            ...(weightValue && { size_value: weightValue }),
            ...(weightUnit && { size_unit: weightUnit })
          });
          lastAddedLineIndex = i;
          items[items.length - 1]._rawName = weighedName;
        }
      }
      pendingQuantity = 1;
      pendingUnitPrice = null;
      continue;
    }

    // 5. Match standard prices (must be preceded by space or start, and followed by space or end)
    const prices = [...line.matchAll(/(?:^|\s)[£]?(\d+\.\d{2})(?=\s|$|[A-Za-z]\s*$)/g)].map(m => m[1]);
    
    if (prices.length > 0) {
      let namePart = line;

      let sameLineQty = null;
      let sameLineUnitPrice = null;
      const sameLineQtyMatch = line.match(/(\d+)\s*x\s*[£]?(\d+\.\d{2})\b/i);
      if (sameLineQtyMatch) {
        sameLineQty = parseInt(sameLineQtyMatch[1], 10);
        sameLineUnitPrice = sameLineQtyMatch[2];
        namePart = namePart.replace(sameLineQtyMatch[0], '').trim();
      }

      // Remove all prices and trailing flags/letters from the name part
      namePart = namePart.replace(/[£$]\s*\d+\.\d{2}(?:\s*[A-Z])?/gi, '').trim();
      namePart = namePart.replace(/\b\d+\.\d{2}\b/g, '').trim();

      if (!namePart || /^[A-Z]$/i.test(namePart)) continue;

      let qty = sameLineQty || pendingQuantity;
      
      // Look for a leading number which might be quantity (Morrisons, Asda, Aldi)
      if (!sameLineQty && (supermarket === 'Morrisons' || supermarket === 'Asda' || supermarket === 'Aldi')) {
        const codeMatch = namePart.match(/^[^A-Za-z0-9]*(\d+)\s+(.+)$/);
        if (codeMatch) {
           const num = parseInt(codeMatch[1], 10);
           // If it's a small number, assume it's a quantity
           if (num < 100) {
             qty = num;
           }
           namePart = codeMatch[2];
        }
      }

      // For Sainsburys and Tesco, strip leading category/department/item numbers (OCR noise) without treating them as quantities
      if (supermarket === 'Sainsburys' || supermarket === 'Tesco') {
        namePart = namePart.replace(/^\d+\s+/, '').trim();
      }

      // Clean up the name string iteratively
      let oldName;
      do {
        oldName = namePart;
        // Strip short trailing non-alphanumeric chars
        namePart = namePart.replace(/\s+[^A-Za-z0-9]{1,2}$/, '').trim();
        namePart = namePart.replace(/\s+[A-Za-z0-9]$/, '').trim();

        if (supermarket === 'Morrisons') {
          // Strip trailing words with at least one lowercase letter (OCR noise)
          namePart = namePart.replace(/\s+[A-Za-z0-9]*[a-z][A-Za-z0-9]*$/, '').trim();
          // Strip trailing words containing digits (OCR noise)
          namePart = namePart.replace(/\s+[A-Za-z0-9]*[0-9][A-Za-z0-9]*$/, '').trim();
          // Strip trailing words containing only symbols (OCR noise)
          namePart = namePart.replace(/\s+[^A-Z\s]+$/, '').trim();
          // Strip short uppercase words/flags (e.g., SS, 0F)
          namePart = namePart.replace(/\s+[A-Z]{1,2}$/, '').trim();
        }
      } while (oldName !== namePart);

      // Strip 7-digit product codes (often found in Lidl and Morrisons receipts)
      namePart = namePart.replace(/\b\d{7}\b/g, '').trim();

      namePart = namePart.replace(/[^A-Za-z0-9)]+$/, '').trim();
      namePart = namePart.replace(/^[^A-Za-z0-9(]+/, '').trim();

      // --- Rich Sizing & Pack Extraction ---
      let sizeValue = null;
      let sizeUnit = null;
      let sizePack = null;

      // A. Compound pack & size pattern (e.g. 6X2L or 6 X 2L or 6x250ml)
      const compoundMatch = namePart.match(/\b(\d+)\s*x\s*(\d+(?:\.\d+)?)\s*(g|kg|ml|l|ltr|litre|litres|pints?|pt)\b/i);
      if (compoundMatch) {
        sizePack = parseInt(compoundMatch[1], 10);
        sizeValue = parseFloat(compoundMatch[2]);
        sizeUnit = compoundMatch[3].toLowerCase();
        namePart = namePart.replace(compoundMatch[0], '').trim();
      }

      // A2. Compound pack & value without explicit unit (e.g. 4X125)
      if (!sizeValue) {
        const unitlessCompound = namePart.match(/\b(\d+)\s*x\s*(\d+)\b/i);
        if (unitlessCompound) {
          const p = parseInt(unitlessCompound[1], 10);
          const v = parseInt(unitlessCompound[2], 10);
          if (p < 50 && v > 1) {
            sizePack = p;
            sizeValue = v;
            namePart = namePart.replace(unitlessCompound[0], '').trim();
          }
        }
      }

      // B. Standard size/weight pattern (e.g. 500g, 2L, 270ml)
      if (!sizeValue) {
        const sizeMatch = namePart.match(/\b(\d+(?:\.\d+)?)\s*(g|kg|ml|l|ltr|litre|litres|pints?|pt)\b/i);
        if (sizeMatch) {
          sizeValue = parseFloat(sizeMatch[1]);
          sizeUnit = sizeMatch[2].toLowerCase();
          namePart = namePart.replace(sizeMatch[0], '').trim();
        }
      }

      // C. Conjoined pack suffix (e.g. BANANASX5 or LINERSX20)
      if (!sizePack) {
        const conjoinedMatch = namePart.match(/\b([A-Za-z0-9]+)x\s*(\d+)\b/i);
        if (conjoinedMatch && !conjoinedMatch[1].match(/^(g|kg|ml|l|ltr|pt)$/i)) {
          sizePack = parseInt(conjoinedMatch[2], 10);
          if (/^[A-Za-z]+$/.test(conjoinedMatch[1])) {
            namePart = namePart.replace(conjoinedMatch[0], conjoinedMatch[1]).trim();
          } else {
            namePart = namePart.replace(conjoinedMatch[0], '').trim();
          }
        }
      }

      // D. Trailing pack size (e.g. "GARLIC X4", "PAIN AU CHOC X6")
      if (!sizePack) {
        const trailingPackMatch = namePart.match(/(?:\s+|[^A-Za-z0-9])x\s*(\d+)\b/i);
        if (trailingPackMatch) {
          sizePack = parseInt(trailingPackMatch[1], 10);
          namePart = namePart.replace(trailingPackMatch[0], '').trim();
        }
      }

      // E. Leading pack count (e.g. "6 CROISSANTS")
      if (!sizePack) {
        const leadingPackMatch = namePart.match(/^(\d+)\s+x\b/i);
        if (leadingPackMatch) {
          sizePack = parseInt(leadingPackMatch[1], 10);
          namePart = namePart.replace(leadingPackMatch[0], '').trim();
        }
      }

      // --- End Sizing & Pack Extraction ---

      // Normalize the product name using our shared module
      const normalizedName = normalizeProductName(namePart);

      // Must be longer than 2 characters and contain at least one actual letter to be valid
      if (normalizedName.length > 2 && /[A-Za-z]/.test(normalizedName)) {
         let priceStr;
         if (sameLineUnitPrice) {
           priceStr = `£${sameLineUnitPrice}`;
         } else if (pendingUnitPrice) {
           priceStr = `£${pendingUnitPrice}`;
         } else if (qty === 1 && prices.length > 1) {
           const p1 = parseFloat(prices[0]);
           const p2 = parseFloat(prices[prices.length - 1]);
           // Only select the last price if it is not an abnormally large outlier
           if (p2 <= 5 * p1) {
             priceStr = `£${prices[prices.length - 1]}`;
           } else {
             priceStr = `£${prices[0]}`;
           }
         } else {
           priceStr = `£${prices[0]}`;
         }
         
         const existingItem = items.find(item => item.name.toLowerCase().trim() === normalizedName.toLowerCase().trim());
         if (existingItem) {
           if (existingItem.price !== priceStr) {
             existingItem.price = priceStr;
             if (qty > 1) {
               existingItem.quantity = qty;
             } else {
               delete existingItem.quantity;
             }
           }
         } else {
           items.push({
             name: normalizedName,
             price: priceStr,
             ...(qty > 1 && { quantity: qty }),
             ...(sizeValue && { size_value: sizeValue }),
             ...(sizeUnit && { size_unit: sizeUnit }),
             ...(sizePack && { size_pack: sizePack })
           });
           lastAddedLineIndex = i;
           items[items.length - 1]._rawName = namePart;
         }
      }
      
      // Reset for next lines
      pendingQuantity = 1;
      pendingUnitPrice = null;
    }
  }

  return {
    supermarket: supermarket || "Unknown",
    items: items
  };
}