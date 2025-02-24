export function parseExtractedText(text) {
  const lines = text.split('\n');
  const items = [];
  let supermarket = '';
  const priceRegex = /£?\d+\.\d{2}/;
  const productNameRegex = /^\d+\s+(.+?)(?=\s+\d+\.\d{2}|$)/; 

  for (const line of lines) {
    const priceMatch = line.match(priceRegex);

    if (line.toLowerCase().includes('supermarket') || line.includes("TESCO") || line.includes("ALDI")) {
      supermarket = line.replace(/^.*:/, "").trim();
    } else if (priceMatch) {
      const price = priceMatch[0];
      const productNameMatch = line.match(productNameRegex);
      let name = line.replace(price, "").trim().split(' ').filter(word => word.length > 2).join(' ');
      if (productNameMatch) {
        name = productNameMatch[1].trim();
      }
      items.push({ name, price });
    }
  }

  return { supermarket, items };
}