import { parseExtractedText } from './utils/parseExtractedText.js';

const morrisons = `
Morrisons
Wm Morrison Supermarkets Ltd BD3 7DL
VAT Number 343475355
1 M SEMI SKIMMED MILK £2.15 £2.15 F
1 M FRUIT JUICE £2.20 £2.20 A
2 ANDREW PEACE SHIRAZ £2.13 £4.26 A
1 SILVER SPOON SUGAR £1.75 £1.75 F
1 SILVER SPOON SUGAR £1.09 £1.09 F
M Bananas 1.220 Kg X £0.99/kg £1.21 F
`;

const aldi = `
ALDI STORES
Drove Road
SWINDON 2
2 x 2.69
728578 ALCAFE DG PODS 5.38 A
62031 Cereal Crisp 1.59 A
827626 OIL EXTRA VIRGIN 6.79 A
737354 BASMATI RICE 5KG 6.99 A
728411 6X2L STILL WATER 2.29 B
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
*KINDER BUENO £1.00
TTD GRAPES CC 400G £2.50
JSBABYCORN £1.32
BROCCOLI LOOSE 0.250 kg @ £2.19/kg £0.55
BP PAIN AU CHOC X6 £1.90
`;

console.log("Morrisons:", JSON.stringify(parseExtractedText(morrisons), null, 2));
console.log("Aldi:", JSON.stringify(parseExtractedText(aldi), null, 2));
console.log("Sainsburys:", JSON.stringify(parseExtractedText(sainsburys), null, 2));
