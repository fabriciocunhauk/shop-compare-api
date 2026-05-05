import { parseExtractedText } from './utils/parseExtractedText.js';

const morrisons = `
Morrisons
VAT Number 343475355
1 M SEMI SKIMMED MILK £2.15 £2.15 F
1 M FRUIT JUICE £2.20 £2.20 A
2 ANDREW PEACE SHIRAZ £2.13 £4.26 A
1 SILVER SPOON SUGAR £1.19 £1.19 F
`;

const aldi = `
ALDI STORES
2 x 2.69
728578 ALCAFE DG PODS 5.38 A
62031 Cereal Crisp 1.59 A
827626 OIL EXTRA VIRGIN 6.79 A
`;

const sainsburys = `
Sainsbury's
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
