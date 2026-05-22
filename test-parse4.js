import { parseExtractedText } from './utils/parseExtractedText.js';

const asdaReceipt = `
ASDA Store Ltd
EXPPFS - 5351 DORCAN WAY
Dorcan Way
SN3 3RA
Tel: 01793 511894
VAT: 362 0127 92

Duplicate

Sat 01 Mar 2025 12:08:09

Store 5351 POS 1
Op Name
Trans 401
ABHI

SALE

Monster Energy Zero 500Ml £1.96
R1-0.6% Bblgum 10Ml £4.99
My First Juice Apple 4X125 £1.52
Walkers Quavers Cheese 6X16G £2.22
Lost Mary Disposable Grape £5.99
`;

const lidlReceipt = `
LIDL
SWI - Greenbridge Retail Park
VAT NO. GB350396892
Enter survey: lidl.co.uk/haveyoursay
& you can win £100 of Lidl Vouchers.
£
Cloudy Apple Juice 2 x £1.75 3.50 B
15% off Naturis -0.52
Dog Food in Gravy 3.19 B
15% off Orlando -0.48
Kids Handwash Strawb 0.99 B
Popcorn Containers L 0465860 3.99 B
Moisture Handwash 0.75 B
W.CounS.SkimMilk 6PT 2.15 A
Neo Rings 1.09 A
Legging Black M40 42 0427279 6.99 B
Choco Fudge Crunch 0.89 B
Strawb Whip Bars 0.89 B
Snack Crackers 2 x £0.99 1.98 A
20622 TWO TONE GARLI 0412278 1.99 B
ChickenBreast Fillet 6.19 A
 1.000 kg @ £6.19/kg
Original Spreadable 1.29 A
Cheese Thins 2 x £0.95 1.90 A
Mozzarella Slices 2.19 A
Choco Nussa Biscuits 2.99 B
Grated Mozzarella 2.19 A
Pickled Onions Red. 0.75 A
Tinned Sweetcorn 1.69 A
Peach IceTea ZeroRFA2 x £1.25 2.50 B
Golden Delicious 0081303 1.49 A
Funsize Apples 0080266 0.69 A
Fun Size Bananas 0080005 0.88 A
12 FR Medium Eggs 2.39 A
Salad Trio 0082114 1.29 A
Croissants 8er 1.39 A
Pink Iced Doughnut 2 x £0.39 0.78 A
Standard White Toile 4.99 B
Pomegranate Seeds 1.89 A
Premium Oranges 0080137 1.89 A
Strawberries 0080803 2.99 A
Cheese Tomato Pizza 2 x £0.58 1.16 A
Nougat Croissants 1.45 A
Sweet Puff Pastry 1.69 A
`;

const tescoReceipt = `
TESCO
Wood Green Lordship Express
Any questions please visit
www.tesco.com/store-locator
VAT Number: GB 220 4302 31

1 J2o Orange & Passion Fruit £4.85
4x275ml
Cc £3.00 -£1.85
1 Harpic Power Plus Citrus Toilet £1.65
Cleaner Gel 750ml
1 Activia Kefir Strawberry Gut £1.85
Health Yoghurt Drink 280ml
Cc £1.25 -£0.60
1 Tesco Chicken Breast Portions £4.20
580g
1 Tesco Green Seedless Grapes £2.30
Pack 500g
Cc £2.00 -£0.30
1 Tesco Express Baby Plum £1.00
Tomatoes 300g
1 Tesco Organic Fair Trade £1.70
Bananas 5 Pack
Cc £1.50 -£0.20
1 Tesco British Mild Cheddar £3.45
Cheese 400g
1 Ferrero Rocher White Chocolate £3.50
Golden Mini Easter Eggs 90g
Cc £2.45 -£1.05
`;

console.log("================= ASDA =================");
console.log(JSON.stringify(parseExtractedText(asdaReceipt), null, 2));

console.log("\n================= LIDL =================");
console.log(JSON.stringify(parseExtractedText(lidlReceipt), null, 2));

console.log("\n================= TESCO =================");
console.log(JSON.stringify(parseExtractedText(tescoReceipt), null, 2));
