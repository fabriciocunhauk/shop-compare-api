import { parseExtractedText } from './utils/parseExtractedText.js';

const tesco = `
Tesco
MILK 4 PINT 1.65
3 x 0.50
KIWI FRUITS 1.50
CLUB CARD SAVING -0.50
`;

const lidl = `
Lidl
123456 APPLES 1.25 A
CHICKEN BREAST 4.50 B
`;

const asda = `
ASDA
GROCERIES
BANANAS £0.80
`;

console.log("Tesco:", JSON.stringify(parseExtractedText(tesco), null, 2));
console.log("Lidl:", JSON.stringify(parseExtractedText(lidl), null, 2));
console.log("Asda:", JSON.stringify(parseExtractedText(asda), null, 2));
