const lines = [
  "z.% 2.69",
  "7268578 ALCAFE DG PODS 5.38 A",
  "2 X UPL ks)",
  "738240 MAMIA WIPES SENSIT 1.50 B",
  "2% 0.65",
  "730155 HEINZ 6%0G 3.39 4 /",
  "806367 CHEESE GRATED M0ZZ 2.19 A /",
  "823289 LEMONS UNWAXED 0.9948",
  "§10350 GARLIC 0.69 A",
  "810873 FAMILY PACK TOMATO BLT.",
  "737354 BASMATL RICE BKG 6.99 A",
  "728411 6X2L STILL WATER 2.298"
];

for (const line of lines) {
  let namePart = line;
  const priceMatch = line.match(/(?:^|\s)[£]?(\d+\.\d{2})/);
  if (!priceMatch) {
    console.log(`SKIP: ${line}`);
    continue;
  }
  const price = priceMatch[1];
  
  // Remove the exact matched price. But if the price had trailing garbage like '48' or '8', we want to remove that too.
  // We can remove the price and any immediately following non-space characters.
  namePart = namePart.replace(new RegExp(`(?:^|\\s)[£]?${price}\\S*`, 'ig'), '').trim();

  // Remove leading product codes (even if preceded by weird chars like §)
  const codeMatch = namePart.match(/^[^A-Za-z0-9]*(\d+)\s+(.+)$/);
  if (codeMatch) {
     const num = parseInt(codeMatch[1], 10);
     if (num >= 100) {
       namePart = codeMatch[2]; // remove product code
     }
  }

  // Iteratively remove trailing single characters, or short punctuation
  let oldName;
  do {
    oldName = namePart;
    namePart = namePart.replace(/\s+[^A-Za-z0-9]{1,2}$/, '').trim(); // trailing punctuation like /
    namePart = namePart.replace(/\s+[A-Za-z0-9]$/, '').trim(); // trailing single char
  } while (oldName !== namePart);

  // Remove trailing weird words like "A /" or just ensure it looks good
  namePart = namePart.replace(/[^A-Za-z0-9)]+$/, '').trim(); // trailing punctuation on the word itself
  namePart = namePart.replace(/^[^A-Za-z0-9(]+/, '').trim(); // leading punctuation on the word itself
  
  if (namePart.length > 2 && /[A-Za-z]/.test(namePart)) {
    console.log(`OK: name="${namePart}", price="${price}" (from "${line}")`);
  } else {
    console.log(`FILTERED: "${namePart}" (from "${line}")`);
  }
}
