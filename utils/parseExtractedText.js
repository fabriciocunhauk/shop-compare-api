export function parseExtractedText(text) {
  const lines = text.split('\n');
  const items = [];
  let supermarket = '';

  
  let pendingQuantity = 1;
  let pendingUnitPrice = null;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) continue;

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
      lowerLine.includes('subtotal')
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

    // 4. Match prices correctly (must be preceded by space or start, and followed by space or end)
    const prices = [...line.matchAll(/(?:^|\s)[£]?(\d+\.\d{2})(?=\s|$|[A-Za-z]\s*$)/g)].map(m => m[1]);
    
    if (prices.length > 0) {
      let namePart = line;
      // Remove all prices from the name part
      for (const p of prices) {
         namePart = namePart.replace(new RegExp(`[£]?${p}(?:\\s+[A-Z])?$`, 'i'), '').trim();
         namePart = namePart.replace(new RegExp(`(?:^|\\s)[£]?${p}(?=\\s|$)`, 'g'), '').trim();
      }

      if (!namePart || /^[A-Z]$/i.test(namePart)) continue;

      let qty = pendingQuantity;
      // Look for a leading number which might be quantity (Morrisons) or product code (Aldi)
      // We also handle cases where OCR added weird symbols before the code like §10350
      const codeMatch = namePart.match(/^[^A-Za-z0-9]*(\d+)\s+(.+)$/);
      if (codeMatch) {
         const num = parseInt(codeMatch[1], 10);
         // If it's a small number, assume it's a quantity
         if (num < 100) {
           qty = num;
         }
         // Either way, remove it from name (removes product codes too)
         namePart = codeMatch[2];
      }

      // Clean up the name string iteratively
      let oldName;
      do {
        oldName = namePart;
        // Remove trailing punctuation or slashes
        namePart = namePart.replace(/\s+[^A-Za-z0-9]{1,2}$/, '').trim();
        // Remove trailing single characters (often VAT flags like 'A' or 'F' or OCR artifacts)
        namePart = namePart.replace(/\s+[A-Za-z0-9]$/, '').trim();
      } while (oldName !== namePart);

      // Remove any weird punctuation attached to the end of the word itself
      namePart = namePart.replace(/[^A-Za-z0-9)]+$/, '').trim();
      // Remove any weird punctuation attached to the beginning of the word itself
      namePart = namePart.replace(/^[^A-Za-z0-9(]+/, '').trim();

      // Remove known store prefixes
      namePart = namePart.replace(/^(JS|M|TTD)\s+/i, '').trim();

      // Must be longer than 2 characters and contain at least one actual letter to be valid
      if (namePart.length > 2 && /[A-Za-z]/.test(namePart)) {
         // Determine unit price: prefer pendingUnitPrice from Aldi, else the first price on line
         const priceStr = pendingUnitPrice ? `£${pendingUnitPrice}` : `£${prices[0]}`;
         
         // Only add if we don't already have this exact product to avoid duplicates in the current run
         if (!items.some(item => item.name === namePart)) {
           items.push({
             name: namePart,
             price: priceStr,
             ...(qty > 1 && { quantity: qty })
           });
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