const parseExtractedText = (text) => {
  const lines = text.split('\n');
  const items = [];
  let supermarket = '';

  const supermarketPattern = /^(tesco|aldi stores|asda|LeDL|Lidl|Sainsbury's|Morrisons)$/i;
  
  let pendingQuantity = 1;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) continue;

    if (!supermarket) {
      if (supermarketPattern.test(line) || line.includes("VAT NO. GB350396892") || line.includes("343475355") || line.includes("660 4548 36")) {
        if (line.includes("VAT NO. GB350396892") || line.toLowerCase().includes("lidl")) {
          supermarket = "Lidl";
        } else if (line.includes("343475355") || line.toLowerCase().includes("morrisons")) {
          supermarket = "Morrisons";
        } else if (line.includes("660 4548 36") || line.toLowerCase().includes("sainsbury")) {
          supermarket = "Sainsburys";
        } else if (line.toLowerCase().includes("aldi")) {
          supermarket = "Aldi";
        } else if (line.toLowerCase().includes("tesco")) {
          supermarket = "Tesco";
        } else if (line.toLowerCase().includes("asda")) {
          supermarket = "Asda";
        } else {
          supermarket = line.replace(/^.*:/, "").trim();
        }
        continue;
      }
    }

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
      lowerLine.includes('vat number')
    ) {
      continue;
    }

    const aldiQtyMatch = line.match(/^(\d+)\s*x\s*[£]?(\d+\.\d{2})$/i);
    if (aldiQtyMatch) {
      pendingQuantity = parseInt(aldiQtyMatch[1], 10);
      continue;
    }

    const prices = [...line.matchAll(/[£]?(\d+\.\d{2})/g)].map(m => m[1]);
    
    if (prices.length > 0) {
      let namePart = line;
      for (const p of prices) {
         namePart = namePart.replace(new RegExp(`[£]?${p}(?:\\s+[A-Z])?$`, 'i'), '').trim();
         namePart = namePart.replace(new RegExp(`[£]?${p}`, 'g'), '').trim();
      }

      if (!namePart || /^[A-Z]$/i.test(namePart)) continue;

      let qty = pendingQuantity;
      const leadingQtyMatch = namePart.match(/^(\d+)\s+(.+)$/);
      if (leadingQtyMatch) {
         qty = parseInt(leadingQtyMatch[1], 10);
         namePart = leadingQtyMatch[2];
      }

      const codeMatch = namePart.match(/^\d+\s+(.+)$/);
      if (codeMatch) {
         namePart = codeMatch[1];
      }

      namePart = namePart.replace(/\s+[a-zA-Z]$/, '').trim();
      namePart = namePart.replace(/^(JS|M)\s+/i, '').trim();

      if (namePart.length > 2) {
         const priceStr = `£${prices[0]}`;
         if (!items.some(item => item.name === namePart)) {
           items.push({
             name: namePart,
             price: priceStr,
             ...(qty > 1 && { quantity: qty })
           });
         }
      }
      pendingQuantity = 1;
    }
  }

  return {
    supermarket: supermarket || "Unknown",
    items: items
  };
}

const morrisons = `
Morrisons
Wm Morrison Supermarkets Ltd BD3 7DL
VAT Number 343475355
1 M SEMI SKIMMED MILK £2.15 £2.15 F
1 M FRUIT JUICE £2.20 £2.20 A
2 ANDREW PEACE SHIRAZ £2.13 £4.26 A
1 SILVER SPOON SUGAR £1.19 £1.19 F
`;

const aldi = `
ALDI STORES
Drove Road
SWINDON 2
2 x 2.69
728578 ALCAFE DG PODS 5.38 A
62031 Cereal Crisp 1.59 A
827626 OIL EXTRA VIRGIN 6.79 A
`;

const sainsburys = `
Sainsbury's
Good food for all of us
STRATTON
Vat Number : 660 4548 36
JS CLOSED C/MUSHR £0.97
2 X Nectar Price Saving -£1.70
PRICE REDUCTION
ORIGINAL PRICE £2.15
JS S/SKIM MLK 3.408L £1.83
`;

console.log("Morrisons:", JSON.stringify(parseExtractedText(morrisons), null, 2));
console.log("Aldi:", JSON.stringify(parseExtractedText(aldi), null, 2));
console.log("Sainsburys:", JSON.stringify(parseExtractedText(sainsburys), null, 2));
