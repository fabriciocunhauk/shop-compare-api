/**
 * fix-product-names.js
 *
 * One-off script to normalise garbled OCR product names already in the database.
 * Run with:  node fix-product-names.js
 *
 * Each entry is: [SQL ILIKE pattern, replacement string]
 * The script runs an UPDATE for every mapping and reports how many rows changed.
 */

import postgres from 'postgres';
import 'dotenv/config';

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

// ---------------------------------------------------------------------------
// Replacement rules — ordered from most specific to most general so broader
// patterns don't interfere with narrower ones.
// Each rule: [pattern (used in ILIKE), replacement]
// We use regexp_replace on the DB side for flexibility.
// ---------------------------------------------------------------------------
const rules = [
  // ── Dairy ──────────────────────────────────────────────────────────────
  { match: /\bS\/SKIM\s*MLK\b/i,              to: 'Semi Skimmed Milk' },
  { match: /\bS\/SKIM\b/i,                    to: 'Semi Skimmed' },
  { match: /\bSEMI\s*SKIM(?:MED)?\s*MILK\b/i, to: 'Semi Skimmed Milk' },
  { match: /\bSEMI\s*SKIM(?:MED)?\b/i,        to: 'Semi Skimmed' },
  { match: /\bSKIM\s*MI\b/i,                  to: 'Skimmed Milk' },
  { match: /\bW\.CounS\.\s*SkimMi\s*lk\b/i,  to: 'Skimmed Milk' },
  { match: /\bMLK\b/i,                        to: 'Milk' },
  { match: /\bELHLEA\b/i,                     to: 'Elmlea' },
  { match: /\bELMLEA\s*DBLE\b/i,              to: 'Elmlea Double Cream' },
  { match: /\bDBLE\b/i,                       to: 'Double' },
  { match: /\bDOUBLE\s*CREAN\b/i,             to: 'Double Cream' },
  { match: /\bDAIRYPRIDE\s*SEMI\s*SKIM\b/i,   to: 'Semi Skimmed Milk' },

  // ── Cheese ─────────────────────────────────────────────────────────────
  { match: /\bCHEESE\s*GRATED\s*M0ZZ\b/i,    to: 'Grated Mozzarella' },
  { match: /\bSSTC\s*GRATED\s*MOZZARLA\b/i,  to: 'Grated Mozzarella' },
  { match: /\bGRATED\s*MOZZARLA\b/i,         to: 'Grated Mozzarella' },
  { match: /\bM0ZZ\b/i,                       to: 'Mozzarella' },
  { match: /\bMOZZARLA\b/i,                   to: 'Mozzarella' },
  { match: /\bBEECHWD\s*S\/CHEESE\b/i,       to: 'Beechwood Soft Cheese' },
  { match: /\bS\/CHEESE\b/i,                  to: 'Soft Cheese' },
  { match: /\bCHEDD\b/i,                      to: 'Cheddar' },
  { match: /\bTTD\s*MTURE\s*CHEDD\s*BITE\b/i,to: 'Mature Cheddar Bites' },
  { match: /\bJACOBS\s*CHED\s*ORIG\b/i,      to: 'Jacobs Cheddar Originals' },

  // ── Eggs ───────────────────────────────────────────────────────────────
  { match: /\bEGGS?\s*MED\b/i,               to: 'Eggs Medium' },
  { match: /\bJS\s*FR\s*EGGS\s*MED\b/i,      to: "Sainsbury's Free Range Eggs Medium" },
  { match: /\bFREE\s*RANGE\s*EGGS\b/i,       to: 'Free Range Eggs' },

  // ── Produce ────────────────────────────────────────────────────────────
  { match: /\bMH\s*SALAD\s*TOMATO\b/i,       to: 'Salad Tomatoes' },
  { match: /\bSALAD\s*TOMATO\b/i,            to: 'Salad Tomatoes' },
  { match: /\bCLASSIC\s*TOMATOES\b/i,        to: 'Tomatoes' },
  { match: /\bLID\s*POMODORINO\s*TOMS\b/i,   to: 'Cherry Tomatoes' },
  { match: /\bTTD\s*POMODORIND?\s*TOMS?\b/i, to: 'Tomatoes' },
  { match: /\bPOMODOR(?:INO|IND|I)?\b/i,     to: 'Tomatoes' },
  { match: /\bTOMS\b/i,                       to: 'Tomatoes' },
  { match: /\bCHEES[E&]+TOM\s*PIZZA\b/i,     to: 'Cheese and Tomato Pizza' },
  { match: /\bCHEESE\s*TOMATO\s*PIZZA\b/i,   to: 'Cheese and Tomato Pizza' },
  { match: /\bHEINZ\s*TOMATO\s*KETCHUP\b/i,  to: 'Tomato Ketchup' },

  { match: /\bSTWB\b/i,                       to: 'Strawberry' },
  { match: /\bSTRAWBS?\b/i,                   to: 'Strawberries' },
  { match: /\bSIRAHBS\b/i,                    to: 'Strawberries' },
  { match: /\bI'M\s*STRAWBERRIES\b/i,         to: 'Strawberries' },
  { match: /\bH\s*STRAWBERRIES\b/i,           to: 'Strawberries' },
  { match: /\bSTRAWBERRIES\b/i,               to: 'Strawberries' },
  { match: /\bJS\s*STRAWBS?\b/i,              to: "Sainsbury's Strawberries" },
  { match: /\bSAS\s*BABY\s*PLUM\b/i,          to: 'Baby Plum Tomatoes' },
  { match: /\bTESCO\s*EXPRESS\s*BABY\s*PLUM\b/i, to: 'Baby Plum Tomatoes' },

  { match: /\bHERRIES\b/i,                    to: 'Cherries' },
  { match: /\bJS\s*RASPBERRIES\b/i,           to: "Sainsbury's Raspberries" },

  { match: /\bCLOSED\s*C\/MUSHR\b/i,         to: 'Closed Cup Mushrooms' },
  { match: /\bC\/MUSHR\b/i,                   to: 'Cup Mushrooms' },
  { match: /\bMUSHR\b/i,                      to: 'Mushrooms' },

  { match: /\bH\s*APPLES\b/i,                to: 'Apples' },
  { match: /\bSSTCA?\s*APPLES?\b/i,          to: 'Apples' },
  { match: /\bFUNSIZE\s*APPLES\b/i,          to: 'Fun Size Apples' },
  { match: /\bGOLDEN\s*DELICIOUS\b/i,         to: 'Golden Delicious Apples' },

  { match: /\bH\s*BLUEBERRIES\b/i,           to: 'Blueberries' },
  { match: /\bBLUEBERRIES\b/i,               to: 'Blueberries' },
  { match: /\bTTD\s*GRAPES\b/i,              to: 'Grapes' },
  { match: /\bGRAPES\s*CC\b/i,               to: 'Grapes' },
  { match: /\bRED\s*GRAPES\b/i,              to: 'Red Grapes' },
  { match: /\bTESCO\s*GREEN\s*SEEDLESS\s*GRAPES\b/i, to: 'Green Seedless Grapes' },
  { match: /\bBRR\s*PREMIUM\s*ORANGES\b/i,   to: 'Premium Oranges' },
  { match: /\bLARGE\s*ORANGES\b/i,           to: 'Large Oranges' },
  { match: /\bSAVERS\s*MANDARINS\b/i,        to: 'Mandarins' },
  { match: /\bHM\s*SAVERS\s*MANDARINS\b/i,   to: 'Mandarins' },
  { match: /\bTHE\s*BEST\s*KIWI\b/i,         to: 'Kiwi' },
  { match: /\bGIANT\s*MANGO\b/i,             to: 'Mango' },
  { match: /\bSHARON\s*FRUIT\b/i,            to: 'Sharon Fruit' },
  { match: /\bBRR\b/i,                        to: '' },
  { match: /\bFUN\s*SIZE\s*BANANAS\b/i,       to: 'Bananas' },
  { match: /\bBANANASXS\b/i,                  to: 'Bananas' },
  { match: /\bPOMEGRANATE\s*SEEDS\b/i,        to: 'Pomegranate Seeds' },

  { match: /\bLARGE\s*CUCUMBER\s*\w*\b/i,    to: 'Large Cucumber' },
  { match: /\bWHOLE\s*CUCUMBER\b/i,           to: 'Whole Cucumber' },
  { match: /\bCUCUMBER\s*EXTRA\b/i,           to: 'Cucumber' },

  { match: /\bSSIS\s*SPRING\s*ONION\b/i,     to: 'Spring Onion' },
  { match: /\bSPRNG\s*ONION\b/i,             to: 'Spring Onion' },
  { match: /\bONION\s*&\s*GARLIC\s*SCE\b/i,  to: 'Onion and Garlic Sauce' },
  { match: /\bUSBABYCORN\b/i,                 to: 'Baby Corn' },
  { match: /\bCORN\s*COBETTES\b/i,            to: 'Corn Cobettes' },
  { match: /\bBST\s*GREEN\s*BEANS\b/i,        to: 'Green Beans' },
  { match: /\bM\s*FRESH\s*CHIVES\b/i,         to: 'Fresh Chives' },
  { match: /\bLEMONS\s*UNWAXED\b/i,           to: 'Unwaxed Lemons' },
  { match: /\bUNWAXED\s*LEHON\b/i,            to: 'Unwaxed Lemon' },
  { match: /\bBROCOLI\b/i,                    to: 'Broccoli' },
  { match: /\bCARROTS\s*\d+\w*\b/i,          to: 'Carrots' },
  { match: /\bBABY\s*POTATOES\b/i,            to: 'Baby Potatoes' },
  { match: /\bSWEETCORN\b/i,                  to: 'Sweetcorn' },
  { match: /\bTINNED\s*SWEETCORN\b/i,         to: 'Tinned Sweetcorn' },
  { match: /\bTONE\s*GARLIC\b/i,              to: 'Garlic' },
  { match: /\bGARLIC\b/i,                     to: 'Garlic' },

  // ── Meat ───────────────────────────────────────────────────────────────
  { match: /\bH\s*GAMHON\s*HAM\b/i,          to: 'Gammon Ham' },
  { match: /\bGAMHON\s*HAM\b/i,              to: 'Gammon Ham' },
  { match: /\bH\s*PORK\s*C\/TAIL\s*SAUS\b/i, to: 'Pork Cocktail Sausages' },
  { match: /\bC\/TAIL\s*SAUS\b/i,            to: 'Cocktail Sausages' },
  { match: /\bFLVRD\s*CIB\s*CHICKEN\b/i,     to: 'Flavoured Chicken' },
  { match: /\bTESCO\s*CHICKEN\s*BREAST\b/i,  to: 'Chicken Breast' },
  { match: /\bCHICKENBREST\s*FILLET\b/i,     to: 'Chicken Breast Fillet' },
  { match: /\bCHICKEN\s*BREAST\s*FILLET\b/i, to: 'Chicken Breast Fillet' },
  { match: /\bBERNARD\s*MATHEWS\b/i,         to: 'Bernard Matthews' },
  { match: /\bBERNARD\s*MATTHEWS?\b/i,       to: 'Bernard Matthews' },
  { match: /\bM\s*STEAK\s*MINCE\b/i,         to: 'Steak Mince' },
  { match: /\bH\s*SALM\+CHEESE\s*S\/W\b/i,   to: 'Salmon and Cheese Sandwich' },
  { match: /\bSALM\s*CUCUMBER\s*S\/W\b/i,    to: 'Salmon and Cucumber Sandwich' },
  { match: /\bSALM\+CHEESE\s*S\/W\b/i,       to: 'Salmon and Cheese Sandwich' },
  { match: /\bM\s*SALM\+CUCUMBER\s*S\/W\b/i, to: 'Salmon and Cucumber Sandwich' },
  { match: /\bGARLIC\s*SAUSAGE\b/i,          to: 'Garlic Sausage' },
  { match: /\bPORK\s*KABANOS\b/i,            to: 'Pork Kabanos' },
  { match: /\bBRAWN\b/i,                      to: 'Brawn' },
  { match: /\bPORK\s*PIE\s*WITH\s*EGG\b/i,   to: 'Pork Pie with Egg' },

  // ── Bakery ─────────────────────────────────────────────────────────────
  { match: /\bHOVIS\s*BREAD\b/i,             to: 'Bread' },
  { match: /\bKINGSMILL\s*50\/50\s*MED\b/i,  to: 'Kingsmill 50/50 Bread Medium' },
  { match: /\bHOT\s*CROSS\s*BUNS\b/i,        to: 'Hot Cross Buns' },
  { match: /\bPIERRE\s*BRIOCHE\b/i,          to: 'Brioche' },
  { match: /\bPIERRE\s*LOAF\b/i,             to: 'Bread Loaf' },
  { match: /\bNOUGAT\s*CROISSANTS\b/i,       to: 'Nougat Croissants' },
  { match: /\b6\s*CROISSANTS\b/i,            to: 'Croissants x6' },
  { match: /\bCROISSANTS\s*8ER\b/i,          to: 'Croissants x8' },
  { match: /\bLUXURY\s*CROISSANTS\b/i,       to: 'Luxury Croissants' },
  { match: /\bCROISSANTS\b/i,                to: 'Croissants' },
  { match: /\bBP\s*PAIN\s*AU\s*CHOC\b/i,     to: 'Pain au Chocolat' },
  { match: /\bPAIN\s*CHOC\b/i,               to: 'Pain au Chocolat' },
  { match: /\bPAIN\s*AU\s*CHOC\b/i,          to: 'Pain au Chocolat' },
  { match: /\bBREADMAF\s*FLOUR\b/i,          to: 'Bread Flour' },
  { match: /\bCEREAL\s*CRISP\b/i,            to: 'Cereal Crisps' },
  { match: /\bKELLOGG'?S\s*FROSTIES\b/i,     to: "Kellogg's Frosties" },

  // ── Pantry ─────────────────────────────────────────────────────────────
  { match: /\bBASMATI\s*RICE\s*BKG\b/i,      to: 'Basmati Rice' },
  { match: /\bBKG\b/i,                        to: 'Bag' },
  { match: /\bOIL\s*EXTRA\s*VIRGIN\b/i,       to: 'Extra Virgin Olive Oil' },
  { match: /\bNAPOLINA\s*EVO\b/i,             to: 'Extra Virgin Olive Oil' },
  { match: /\bOIL\s*SUNFLOWER\b/i,            to: 'Sunflower Oil' },
  { match: /\bSUNFLOWER\s*OIL\b/i,           to: 'Sunflower Oil' },
  { match: /\bSILVER\s*SPOON\s*SUGAR\b/i,    to: 'Sugar' },
  { match: /\bBEANS\s*TOM\s*SCE\b/i,         to: 'Baked Beans in Tomato Sauce' },
  { match: /\bBAKED\s*BEANS\b/i,              to: 'Baked Beans' },
  { match: /\bJSTABLE\s*SALT\b/i,             to: 'Table Salt' },
  { match: /\bONION\s*&\s*GARLIC\s*SCE\b/i,  to: 'Onion and Garlic Sauce' },
  { match: /\bDISTILLED\s*VINEGAR\b/i,        to: 'Distilled White Vinegar' },
  { match: /\bWHITEWINE\s*VINEGAR\b/i,        to: 'White Wine Vinegar' },
  { match: /\bPLAIN\s*FLR\b/i,               to: 'Plain Flour' },
  { match: /\bSPAGHETTI\s*\d+KG\b/i,         to: 'Spaghetti' },
  { match: /\bHOUMOUS\b/i,                    to: 'Hummus' },
  { match: /\bANTIPASTO\b/i,                  to: 'Antipasto' },
  { match: /\bHP\s*SAUCE\s*HANDY\s*PACK\b/i,  to: 'HP Sauce' },
  { match: /\bLOTUS\s*BISCOFF\b/i,            to: 'Lotus Biscoff Biscuits' },
  { match: /\bM\s*SOFT\s*CHEESE\b/i,          to: 'Soft Cheese' },
  { match: /\bSOFT\s*CHEESE\b/i,              to: 'Soft Cheese' },
  { match: /\bCOUNTRY\s*BUTTER\b/i,           to: 'Butter' },
  { match: /\bLURPAK\s*BTR\b/i,               to: 'Lurpak Butter' },
  { match: /\bORIGINAL\s*SPREADABLE\b/i,      to: 'Spreadable Butter' },

  // ── Drinks ─────────────────────────────────────────────────────────────
  { match: /\bM\s*CLOUDY\s*APPLE\s*JUICE\b/i, to: 'Cloudy Apple Juice' },
  { match: /\bCLOUDY\s*APPLE\s*JUICE\b/i,     to: 'Cloudy Apple Juice' },
  { match: /\bH\s*FRUIT\s*JUICE\b/i,          to: 'Fruit Juice' },
  { match: /\bM\s*FRUIT\s*JUICE\b/i,          to: 'Fruit Juice' },
  { match: /\bJS\s*APPLE\s*JUICE\b/i,         to: "Sainsbury's Apple Juice" },
  { match: /\bAPPLE\s*JUICE\s*\d+LT\b/i,      to: 'Apple Juice' },
  { match: /\bSTILL\s*WATER\b/i,              to: 'Still Water' },
  { match: /\bHYORS\s*STILL\s*WATER\b/i,      to: 'Still Water' },
  { match: /\bALCAFE\s*DG\s*PODS\b/i,         to: 'Coffee Pods' },
  { match: /\bLAVAZZA\b/i,                    to: 'Lavazza Coffee' },
  { match: /\bSTARBUCKS\s*LATTE\b/i,          to: 'Starbucks Latte' },
  { match: /\bCOKE\s*ZERO\b/i,                to: 'Coke Zero' },
  { match: /\bRED\s*BULL\s*ZERO\b/i,          to: 'Red Bull Zero' },
  { match: /\bBUD\s*LIGHT\b/i,                to: 'Bud Light' },
  { match: /\b7UP\s*ZERO\b/i,                 to: '7UP Zero' },
  { match: /\b7UP\s*ZERO\s*\w+\b/i,           to: '7UP Zero' },

  // ── Yogurt / Dairy products ─────────────────────────────────────────────
  { match: /\bVILLAGE\s*DAIRY\s*YOGURT\b/i,  to: 'Yogurt' },
  { match: /\bGREEK\s*STYLE\s*YOGURT\b/i,     to: 'Greek Style Yogurt' },
  { match: /\bGREEK\s*YOGURT\b/i,             to: 'Greek Yogurt' },
  { match: /\bGREEK\s*YOG\b/i,               to: 'Greek Yogurt' },
  { match: /\bFROMAGE\s*FRAIS\b/i,            to: 'Fromage Frais' },
  { match: /\bH\s*MOZZARELLA\b/i,             to: 'Mozzarella' },

  // ── Household ──────────────────────────────────────────────────────────
  { match: /\bPLENTY\s*KITCHEN\s*ROLL\b/i,   to: 'Kitchen Roll' },
  { match: /\bMAMIA\s*WIPES\s*SENSIT\b/i,    to: 'Baby Wipes Sensitive' },
  { match: /\bLENOR\s*FAB\/ENHANCER\b/i,      to: 'Fabric Conditioner' },
  { match: /\bFAIR\s*HAND\s*DISHWASH\b/i,    to: 'Washing Up Liquid' },
  { match: /\bCIF\s*FLOOR\s*CLEANER\b/i,     to: 'Floor Cleaner' },
  { match: /\bMARI\s*GOLD\s*GLOVES\b/i,      to: 'Marigold Gloves' },
  { match: /\bMARI\s*GOLD\b/i,               to: 'Marigold Gloves' },
  { match: /\bBIN\s*LINERS\b/i,              to: 'Bin Liners' },
  { match: /\bREFUSE\s*SACK\b/i,             to: 'Refuse Sacks' },
  { match: /\bBAG\s*FOR\s*LIFE\b/i,          to: 'Bag for Life' },
  { match: /\bTHICK\s*BLEACH\b/i,            to: 'Thick Bleach' },
  { match: /\bSCOURING\s*SPONGE\b/i,         to: 'Scouring Sponge' },
];

// ---------------------------------------------------------------------------
// Phase 2 — Direct price corrections (confirmed from receipt photo)
// ---------------------------------------------------------------------------
const priceCorrections = [
  // Confirmed from Morrisons receipt photo: unit price is £7.75, not £2.70
  { id: 23, name: 'YELLOW TAIL JAM/RED', correctPrice: 7.75 },
  // Andrew Peace Shiraz confirmed at £2.13
  // (IDs may vary — match by name across Morrisons)
];

// ---------------------------------------------------------------------------
// Phase 3 — Garbage rows to delete by ID (non-grocery / receipt metadata)
// ---------------------------------------------------------------------------
const garbageIds = [
  7,   // CHS RAINCOAT (clothing)
  41,  // TV & SATELITE MAG (magazine)
  50,  // SWINDON ADVERTISER (newspaper)
  56,  // CREATOR PAPER SHAPES (stationery)
  89,  // NUTMEG DITSY MUG (homeware)
  90,  // NUTHEG HEART MUG (homeware)
  97,  // 3PK GREY H&T BRAMBLE (clothing)
  98,  // W DESSERT COLLECTION (ambiguous non-food)
  109, // ORIGINAL PRICE (receipt metadata)
  129, // 0416 /kg (weight line)
  130, // GINAL PRICE (OCR of "original price")
  147, // BTS 2PK UNISEX (clothing)
  148, // 1PK UNISEX SHEA (clothing/toiletry)
  151, // ORIGINAL PRICE (receipt metadata)
  152, // USBABYCORN — will be fixed to Baby Corn by name rules
  188, // al 1 BRAWN (garbled — duplicate of id 33 BRAWN)
  277, // Legging Black M40 42 (clothing)
  296, // 0.434 (weight/price fragment)
];

// ---------------------------------------------------------------------------
// Phase 4 — Missing products to insert (confirmed from receipt photo)
// ---------------------------------------------------------------------------
const missingProducts = [
  { supermarket: 'Morrisons', name: 'Martini Bianco',    price: 11.75 },
  { supermarket: 'Morrisons', name: 'Popchips Sour Cream', price: 2.25 },
  { supermarket: 'Morrisons', name: 'Andrew Peace Shiraz', price: 2.13 },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('🔧 Connecting to database...\n');
  let totalUpdated = 0;

  // ── Phase 1: Fix product names ──────────────────────────────────────────
  console.log('── Phase 1: Normalising product names ──');
  const allRows = await sql`SELECT id, product_name FROM supermarket`;

  for (const rule of rules) {
    const toUpdate = allRows.filter(r => rule.match.test(r.product_name));
    for (const row of toUpdate) {
      const newName = row.product_name.replace(rule.match, rule.to).replace(/\s{2,}/g, ' ').trim();
      if (!newName || newName === row.product_name) continue;
      await sql`
        UPDATE supermarket
        SET product_name = ${newName}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${row.id}
      `;
      console.log(`  ✅ [${row.id}] "${row.product_name}" → "${newName}"`);
      totalUpdated++;
    }
  }

  // ── Phase 2: Fix confirmed wrong prices ─────────────────────────────────
  console.log('\n── Phase 2: Correcting wrong prices ──');
  for (const fix of priceCorrections) {
    const result = await sql`
      UPDATE supermarket
      SET price = ${fix.correctPrice}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${fix.id}
      RETURNING id, product_name, price
    `;
    if (result.length > 0) {
      console.log(`  💰 [${fix.id}] "${fix.name}" price corrected → £${fix.correctPrice}`);
    }
  }

  // Also fix by name pattern for Morrisons where price > £15 (OCR read subtotal as unit price)
  const impossiblePrices = await sql`
    SELECT id, product_name, price FROM supermarket
    WHERE CAST(price AS NUMERIC) > 20
  `;
  for (const row of impossiblePrices) {
    console.log(`  ⚠️  [${row.id}] "${row.product_name}" has suspicious price £${row.price} — deleting`);
  }
  if (impossiblePrices.length > 0) {
    const ids = impossiblePrices.map(r => r.id);
    await sql`DELETE FROM supermarket WHERE id = ANY(${ids})`;
    console.log(`  🗑  Deleted ${impossiblePrices.length} rows with impossible prices (>£20)`);
  }

  // ── Phase 3: Delete garbage rows ────────────────────────────────────────
  console.log('\n── Phase 3: Removing garbage rows ──');

  // Delete by known bad IDs
  if (garbageIds.length > 0) {
    const deleted = await sql`
      DELETE FROM supermarket WHERE id = ANY(${garbageIds}) RETURNING id, product_name
    `;
    deleted.forEach(r => console.log(`  🗑  [${r.id}] "${r.product_name}"`));
    console.log(`  Removed ${deleted.length} non-grocery/metadata rows`);
  }

  // Delete by pattern (receipt metadata, weight lines, etc.)
  const patternDeleted = await sql`
    DELETE FROM supermarket
    WHERE
      length(trim(product_name)) < 3
      OR product_name ~ '^[0-9./ ]+$'
      OR product_name ILIKE 'original price%'
      OR product_name ILIKE 'ginal price%'
      OR product_name ILIKE '%/kg'
      OR product_name ILIKE '0.%'
      OR product_name ILIKE '%vat number%'
      OR product_name ILIKE 'explore. graves'
      OR product_name ILIKE 'al 1 %'
    RETURNING id, product_name
  `;
  patternDeleted.forEach(r => console.log(`  🗑  [${r.id}] "${r.product_name}" (pattern match)`));
  console.log(`  Removed ${patternDeleted.length} additional garbage rows by pattern`);

  // ── Phase 4: Deduplicate ────────────────────────────────────────────────
  console.log('\n── Phase 4: Deduplicating ──');
  // Keep only the most recently updated row per (supermarket_name, product_name)
  const dupeDeleted = await sql`
    DELETE FROM supermarket
    WHERE id NOT IN (
      SELECT DISTINCT ON (LOWER(TRIM(supermarket_name)), LOWER(TRIM(product_name)))
        id
      FROM supermarket
      ORDER BY LOWER(TRIM(supermarket_name)), LOWER(TRIM(product_name)), updated_at DESC
    )
    RETURNING id, supermarket_name, product_name
  `;
  if (dupeDeleted.length > 0) {
    dupeDeleted.forEach(r => console.log(`  🔁 [${r.id}] Dupe removed: "${r.product_name}" @ ${r.supermarket_name}`));
    console.log(`  Removed ${dupeDeleted.length} duplicate rows`);
  } else {
    console.log('  No duplicates found.');
  }

  // ── Phase 5: Insert missing products ────────────────────────────────────
  console.log('\n── Phase 5: Inserting missing products ──');
  for (const item of missingProducts) {
    const existing = await sql`
      SELECT id FROM supermarket
      WHERE LOWER(TRIM(supermarket_name)) = LOWER(TRIM(${item.supermarket}))
        AND LOWER(TRIM(product_name)) = LOWER(TRIM(${item.name}))
    `;
    if (existing.length === 0) {
      await sql`
        INSERT INTO supermarket (supermarket_name, product_name, price)
        VALUES (${item.supermarket}, ${item.name}, ${item.price})
      `;
      console.log(`  ➕ Inserted "${item.name}" @ ${item.supermarket} — £${item.price}`);
    } else {
      console.log(`  ⏭  Already exists: "${item.name}" @ ${item.supermarket}`);
    }
  }

  console.log(`\n✨ Done. ${totalUpdated} names normalised.`);
  await sql.end();
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
