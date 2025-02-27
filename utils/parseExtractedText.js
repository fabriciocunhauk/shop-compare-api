export function parseExtractedText(text) {
  const lines = text.split('\n');
  const items = [];
  let supermarket = '';
  
  // Case-insensitive match for supermarket identifiers
const supermarketPattern = /^(tesco|aldi stores|asda|lidl|sainsbury['’]?s?|morrisons)$/i;
// const supermarketPattern = /^(tesco|aldi stores|asda|lidl|sainsbury?s?|morrisons)$/i;

  const pricePattern = /([£]?\d+\.\d{2})(?!\d)/;
  const productPattern = /(?:(\d+)\s*x?\s*)?(.+?)\s+([£]?\d+\.\d{2})$/i;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (supermarketPattern.test(line)) {
      supermarket = line.replace(/^.*:/, "").trim();
      continue;
    }

    // Attempt structured product parsing first
    const productMatch = line.match(productPattern);
    if (productMatch) {
      const [, quantity, rawName, price] = productMatch;
      
      // Clean up the product name: remove leading/trailing numbers and trim whitespace
      let name = rawName.replace(/£\d+\.\d+/, "").trim().split(' ').filter(word => word.length > 2).join(' ');

      // Ignore invalid product names (blank, single char, or just digits)
      if (!name || name.length <= 1 || /^\d+$/.test(name)) {
        continue;
      }

      // Check if the product is already in the list
      const isDuplicate = items.some(item => item.name === name);

      if (!isDuplicate) {
        items.push({
          name: name,
          price: price.startsWith('£') ? price : `£${price}`,
          ...(quantity && { quantity: parseInt(quantity) })
        });
      }
      continue;
    }

    // Fallback price extraction
    const priceMatch = line.match(pricePattern);
    if (priceMatch) {
      const price = priceMatch[0];
      const name = line.slice(0, priceMatch.index).trim();

      // Clean up the product name: remove leading/trailing numbers and trim whitespace
      let cleanedName = name.replace(/^\d+\s*/, '').trim();

      // Ignore invalid product names (blank, single char, or just digits)
      if (!cleanedName || cleanedName.length <= 1 || /^\d+$/.test(cleanedName)) {
        continue;
      }

      // Check if the product is already in the list
      const isDuplicate = items.some(item => item.name === cleanedName);

      if (!isDuplicate) {
        items.push({
          name: cleanedName,
          price: price.startsWith('£') ? price : `£${price}`
        });
      }
    }
  }

  return {
    supermarket: supermarket,
    items: items.filter(item => item.name && item.price)
  };
}