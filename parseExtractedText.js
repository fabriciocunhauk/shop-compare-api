export function parseExtractedText(text) { 
  const lines = text.split('\n');
  const items = [];
  let supermarket = '';

  for (const line of lines) { 
    if (line.toLowerCase().includes('supermarket')) { 
      supermarket = line.replace(/^.*:/, "").trim(); 
    } else if (line.includes('£')) {
      const priceMatch = line.match(/£\d+\.\d+/);
      if (priceMatch) { 
        const price = priceMatch[0];
        const name = line.replace(/£\d+\.\d+/, "").trim().split(' ').filter(word => word.length > 2).join(' ');
        items.push({ name, price });
      }
    }
  }

  return { supermarket, items };
}