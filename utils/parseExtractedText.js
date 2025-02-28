export function parseExtractedText(text) {
  const lines = text.split('\n');
  const items = [];
  let supermarket = '';

  const supermarketPattern = /^(tesco|aldi stores|asda)$/i;
  const pricePattern = /([£]?\d+\.\d{2})(?!\d)/;
  const productPattern = /(?:(\d+)\s*x?\s*)?(.+?)\s+([£]?\d+\.\d{2})$/i;

  function cleanProductName(name) {
    return name.replace(/£\d+\.\d+/, "").trim().split(' ').filter(word => word.length > 2).join(' ');
  }

  function isValidProductName(name) {
    return name && name.length > 1 && !/^\d+$/.test(name);
  }

  function parseProductLine(line) {
    const productMatch = line.match(productPattern);
    if (!productMatch) return null;

    const [, quantity, rawName, price] = productMatch;
    const name = cleanProductName(rawName);

    if (!isValidProductName(name)) return null;

    return {
      name,
      price: price.startsWith('£') ? price : `£${price}`,
      ...(quantity && {
        quantity: parseInt(quantity, 10)
      })
    };
  }

  function parseFallbackLine(line) {
    const priceMatch = line.match(pricePattern);
    if (!priceMatch) return null;

    const price = priceMatch[0];
    const name = line.slice(0, priceMatch.index).trim();
    const cleanedName = cleanProductName(name);

    if (!isValidProductName(cleanedName)) return null;

    return {
      name: cleanedName,
      price: price.startsWith('£') ? price : `£${price}`
    };
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (supermarketPattern.test(line) || line.includes("GB275834273") || line.includes("343475355") || line.includes("660 4548 36")) {
      if (line.includes("GB275834273")) {
        supermarket = "LIDL";
      } else if (line.includes("343475355")) {
        supermarket = "Morrisons";
      } else if (line.includes("660 4548 36")) {
        supermarket = "Sainsburys";
      } else {
        supermarket = line.replace(/^.*:/, "").trim();
      }
      continue;
    }

    const product = parseProductLine(line);
    if (product) {
      if (!items.some(item => item.name === product.name)) {
        items.push(product);
      }
      continue;
    }

    const fallbackProduct = parseFallbackLine(line);
    if (fallbackProduct) {
      if (!items.some(item => item.name === fallbackProduct.name)) {
        items.push(fallbackProduct);
      }
    }
  }

  return {
    supermarket: supermarket,
    items: items.filter(item => item.name && item.price)
  };
}