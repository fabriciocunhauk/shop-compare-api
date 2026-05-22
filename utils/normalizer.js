/**
 * utils/normalizer.js
 * 
 * Reusable product name normalizer incorporating the cleanup rules from fix-product-names.js.
 */

export const rules = [
  // ── Dairy ──────────────────────────────────────────────────────────────
  { match: /\bS\/SKIM\s*MLK\b/i,              to: 'Semi Skimmed Milk' },
  { match: /\bS\/SKIM\b/i,                    to: 'Semi Skimmed' },
  { match: /\bSEMI\s*SKIM(?:MED)?\s*MILK\b/i, to: 'Semi Skimmed Milk' },
  { match: /\bSEMI\s*SKIM(?:MED)?\b/i,        to: 'Semi Skimmed' },
  { match: /\bSKIM\s*MI\b/i,                  to: 'Skimmed Milk' },
  { match: /\bW\.CounS\.\s*Skim(?:med)?\s*(?:Mi\s*lk|Milk|Mlk)\b/i, to: 'Skimmed Milk' },
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
  { match: /\b(?:CHEESTRIN|EESTRIN)\b/i,      to: 'Cheestrings' },

  // ── Eggs ───────────────────────────────────────────────────────────────
  { match: /\bFR\s*EGGS\s*MED\b/i,           to: 'Free Range Eggs Medium' },
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
  { match: /\bSTRA?W?BS?\b/i,                 to: 'Strawberries' },
  { match: /\bSTRAWB\b/i,                     to: 'Strawberry' },
  { match: /\bSIRAHBS\b/i,                    to: 'Strawberries' },
  { match: /\bI'M\s*STRAWBERRIES\b/i,         to: 'Strawberries' },
  { match: /\bH\s*STRAWBERRIES\b/i,           to: 'Strawberries' },
  { match: /\bSTRAWBERRIES\b/i,               to: 'Strawberries' },
  { match: /\bJS\s*STRAWBS\b/i,               to: "Sainsbury's Strawberries" },
  { match: /\bJS\s*STRAWB\b/i,                to: "Sainsbury's Strawberry" },
  { match: /\bSAS\s*BABY\s*PLUM\b/i,          to: 'Baby Plum Tomatoes' },
  { match: /\bTESCO\s*EXPRESS\s*BABY\s*PLUM(?:\s*TOMATO(?:ES)?)?\b/i, to: 'Baby Plum Tomatoes' },

  { match: /\bHERRIES\b/i,                    to: 'Cherries' },
  { match: /\bJS\s*RASPBERRIES\b/i,           to: "Sainsbury's Raspberries" },

  { match: /\bCLOSED\s*C\/MUSHR\b/i,         to: 'Closed Cup Mushrooms' },
  { match: /\bC\/MUSHR\b/i,                   to: 'Cup Mushrooms' },
  { match: /\bMUSHR\b/i,                      to: 'Mushrooms' },

  { match: /\bH\s*APPLES\b/i,                to: 'Apples' },
  { match: /\bSSTCA?\s*APPLES?(?:\s*XB)?\b/i, to: 'Apples' },
  { match: /\bFUNSIZE\s*APPLES\b/i,          to: 'Fun Size Apples' },
  { match: /\bGOLDEN\s*DELICIOUS\b/i,         to: 'Golden Delicious Apples' },

  { match: /\bH\s*BLUEBERRIES\b/i,           to: 'Blueberries' },
  { match: /\bBLUEBERRIES\b/i,               to: 'Blueberries' },
  { match: /\bTTD\s*GRAPES\b/i,              to: 'Grapes' },
  { match: /\bGRAPES\s*CC\b/i,               to: 'Grapes' },
  { match: /\bRED\s*GRAPES\b/i,              to: 'Red Grapes' },
  { match: /\bTESCO\s*GREEN\s*SEEDLESS\s*GRAPES(?:\s*PACK)?\b/i, to: 'Green Seedless Grapes' },
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
  { match: /\b(?:JS\s+)?(?:FT\s+)?BANANASYS\b/i, to: 'Bananas' },
  { match: /\bPOMEGRANATE\s*SEEDS\b/i,        to: 'Pomegranate Seeds' },
  { match: /\b(?:TD|TTD)\s*EASY\s*PEEL\b/i,   to: 'Easy Peelers' },
  { match: /\bBABY\s*COURGETTES\b/i,          to: 'Baby Courgettes' },
  { match: /\bCARROTS\b/i,                    to: 'Carrots' },
  { match: /\bONIONS\b/i,                    to: 'Onions' },
  { match: /\bSSTC\s*APPLES\s*XB\b/i,         to: 'Apples' },

  { match: /\bLARGE\s*CUCUMBER\s*\w*\b/i,    to: 'Large Cucumber' },
  { match: /\bWHOLE\s*CUCUMBER\b/i,           to: 'Whole Cucumber' },
  { match: /\bCUCUMBER(?:\s*_\s*|\s+)EXTRA\b/i, to: 'Cucumber' },
  { match: /\b(?:SPCL\s*)?MIX(?:ED)?\s*VEG\b/i, to: 'Mixed Vegetables' },
  { match: /\bSpL\s*IX\s*VEG\b/i,            to: 'Mixed Vegetables' },

  { match: /\bSSIS\s*SPRING\s*ONION\b/i,     to: 'Spring Onion' },
  { match: /\bSPRNG\s*ONION\b/i,             to: 'Spring Onion' },
  { match: /\bONION\s*&\s*GARLIC\s*SCE\b/i,  to: 'Onion and Garlic Sauce' },
  { match: /\b(?:JS|US)?\s*BABYCORN\b/i,      to: 'Baby Corn' },
  { match: /\bCORN\s*COBETTES\b/i,            to: 'Corn Cobettes' },
  { match: /\b(?:BST|TBST)\s*GREEN\s*BEANS\b/i, to: 'Green Beans' },
  { match: /\bM\s*FRESH\s*CHIVES\b/i,         to: 'Fresh Chives' },
  { match: /\bLEMONS\s*UNWAXED\b/i,           to: 'Unwaxed Lemons' },
  { match: /\bUNWAXED\s*LEHON\b/i,            to: 'Unwaxed Lemon' },
  { match: /\bBROCCOLI(?:\s*LOOSE)?\b/i,      to: 'Broccoli' },
  { match: /\bBROCOLI\b/i,                    to: 'Broccoli' },
  { match: /\bCARROTS\s*\d+\w*\b/i,          to: 'Carrots' },
  { match: /\bBABY\s*POTATOES\b/i,            to: 'Baby Potatoes' },
  { match: /\bSWEETCORN\b/i,                  to: 'Sweetcorn' },
  { match: /\bTINNED\s*SWEETCORN\b/i,         to: 'Tinned Sweetcorn' },
  { match: /\bTWO\s*TONE\s*GARLI(?:C)?\b/i,    to: 'Two Tone Garlic' },
  { match: /(?<!\bTWO\s+)TONE\s*GARLI(?:C)?\b/i, to: 'Garlic' },
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
  { match: /\bBERNARD\s*MAT[T]?HEWS(?:\s*SLI)?\b/i, to: 'Bernard Matthews' },
  { match: /\bTHIN\s*COOKED\s*HAM\b/i,        to: 'Thin Cooked Ham' },
  { match: /\bM\s*STEAK\s*MINCE\b/i,         to: 'Steak Mince' },
  { match: /\bH\s*SALM\+CHEESE\s*S\/W\b/i,   to: 'Salmon and Cheese Sandwich' },
  { match: /\bSALM\s*CUCUMBER\s*S\/W\b/i,    to: 'Salmon and Cucumber Sandwich' },
  { match: /\bSALM\+CHEESE\s*S\/W\b/i,       to: 'Salmon and Cheese Sandwich' },
  { match: /\bM\s*SALM\+CUCUMBER\s*S\/W\b/i, to: 'Salmon and Cucumber Sandwich' },
  { match: /\bGARLIC\s*SAUSAGE\b/i,          to: 'Garlic Sausage' },
  { match: /\bPORK\s*KABANOS\b/i,            to: 'Pork Kabanos' },
  { match: /\bBRAWN\b/i,                      to: 'Brawn' },
  { match: /\bPORK\s*PIE\s*WITH\s*EGG\b/i,   to: 'Pork Pie with Egg' },
  { match: /\bPEPERANI\s*MINIS\b/i,          to: 'Peperami Minis' },

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
  { match: /\bAE\s*BATN\s*AL\s*CHE\b/i,      to: 'Pain au Chocolat' },
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
  { match: /\b(?:H\s+)?BOURBECK(?:\s*CREAM)?\b/i, to: 'Bourbon Creams' },
  { match: /\bSTRAMBERRY\s*CONSERVE\b/i,      to: 'Strawberry Conserve' },
  { match: /\bM\s*SOFT\s*CHEESE\b/i,          to: 'Soft Cheese' },
  { match: /\bSOFT\s*CHEESE\b/i,              to: 'Soft Cheese' },
  { match: /\bCOUNTRY\s*BUTTER\b/i,           to: 'Butter' },
  { match: /\bLURPAK\s*BTR\b/i,               to: 'Lurpak Butter' },
  { match: /\bORIGINAL\s*SPREADABLE\b/i,      to: 'Spreadable Butter' },
  { match: /\bBRUSH\s*BUR\b/i,                to: 'Butter' },
  { match: /\bBRTISH\s*BUTTR\b/i,             to: 'Butter' },
  { match: /\b(?:HRT\s+)?(?:SF\s+)?ST[WH]?B?\s*JLLY\b/i, to: 'Strawberry Jelly' },
  { match: /\b(?:TAJ\s+)?(?:MOGO|logo)\s*CHIPS\b/i, to: 'Mogo Chips' },

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
  { match: /\bMonsi\s*er\s*fnergy\s*(?:Jel|Zero)?\b/i, to: 'Monster Energy Zero' },
  { match: /\bMonster\s*Energy\s*Zero\b/i,     to: 'Monster Energy Zero' },
  { match: /\bR1-0\s*6%\s*Bblgum\b/i,          to: 'R1-0.6% Bblgum' },
  { match: /\bRED\s*BULL\s*ZERO\b/i,          to: 'Red Bull Zero' },
  { match: /\bBUD\s*LIGHT\b/i,                to: 'Bud Light' },
  { match: /\b7UP\s*ZERO\b/i,                 to: '7UP Zero' },
  { match: /\b7UP\s*ZERO\s*\w+\b/i,           to: '7UP Zero' },
  { match: /\b(?:SRUBICON|RUBICON)\s*(?:STL\s*)?GUAVA\b/i, to: 'Rubicon Guava' },

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
  { match: /\bMARI\s*GOLD(?:\s*GLOVES)?\b/i, to: 'Marigold Gloves' },
  { match: /\bSOUR\s*PATCH\s*(?:K10S|KIDS)\b/i, to: 'Sour Patch Kids' },
  { match: /\bNUTHEG\s*DITSY\s*HUG\b/i,      to: 'Nutmeg Ditsy Mug' },
  { match: /\bNUTHEG\s*HEART\s*HUG\b/i,      to: 'Nutmeg Heart Mug' },
  { match: /\bNUTHEG\s*HOME\s*(?:Boul|BOWL)\b/i, to: 'Nutmeg Home Bowl' },
  { match: /\bNUTHEG\b/i,                     to: 'Nutmeg' },
  { match: /\bBIN\s*LINERS\b/i,              to: 'Bin Liners' },
  { match: /\bREFUSE\s*SACK\b/i,             to: 'Refuse Sacks' },
  { match: /\bBAG\s*FOR\s*LIFE\b/i,          to: 'Bag for Life' },
  { match: /\bTHICK\s*BLEACH\b/i,            to: 'Thick Bleach' },
  { match: /\bSCOURING\s*SPONGE\b/i,         to: 'Scouring Sponge' },
  { match: /\b(?:ORIGIVL\s+BY|CADDY)\s*LINERS\b/i, to: 'Bin Liners' },
  { match: /\b(?:JS\s+)?(?:FOOD\s+)?BAGS\b/i, to: 'Food Bags' },
];

/**
 * Normalizes raw scanned product names using the rules directory.
 * Includes pre-cleaning steps to resolve conjoined prefixes like JSBABYCORN.
 * 
 * @param {string} rawName 
 * @returns {string} Normalized product name
 */
export function normalizeProductName(rawName) {
  if (!rawName) return '';

  let clean = rawName.replace(/^(JS|TTD|J5|3S|US|TD)(?=[A-Z])/g, '$1 ')
                      .replace(/^(js|ttd|j5|3s|us|td)(?=[a-z])/g, '$1 ')
                      .trim();

  // Clean up punctuation noise like underscores and commas
  clean = clean.replace(/_/g, ' ').replace(/,/g, '').trim();

  // Strip generic trailing numeric noise (like misread weights e.g. 1505 or 4006)
  clean = clean.replace(/\s+\d+[a-zA-Z]*$/, '').trim();

  // 2. Apply all structural replacement rules
  for (const rule of rules) {
    clean = clean.replace(rule.match, rule.to);
  }

  // 3. Strip remaining store prefixes if they are still at the start (e.g. JS BABYCORN -> BABYCORN if not matched by rule)
  clean = clean.replace(/^(JS|J5|3S|US|TTD|TD|M|Tesco|H|LH|1H|1M)\s+/i, '').trim();

  // Strip single-character leading noise (e.g. "i The Best..." -> "The Best...")
  clean = clean.replace(/^[a-zA-Z]\s+/, '').trim();

  // 4. Post-cleaning: strip conjoined spaces, clean remaining weird OCR artifacts
  clean = clean.replace(/\s{2,}/g, ' ')
               .replace(/^[^A-Za-z0-9(]+/, '') // leading punctuation (excluding opening bracket)
               .replace(/[^A-Za-z0-9)]+$/, '') // trailing punctuation (excluding closing bracket)
               .trim();

  return clean;
}
