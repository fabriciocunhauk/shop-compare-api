import sql from './db.js'

export async function getPriceList() {
  const priceList = await sql`
SELECT * FROM supermarket
`
  return priceList
}

export async function deleteImage(id) {
  const image = await sql`
    DELETE FROM images WHERE id = ${id}
  `
  return image
}

export async function insertImage( data ) {
  const image = await sql`
    insert into images (data) VALUES (${data}) returning *
  `
  return image
}

export function getProductUniqueKey(name, size_value, size_unit, size_pack) {
  const n = name.toLowerCase().trim();
  const sv = size_value !== undefined && size_value !== null ? parseFloat(size_value) : '';
  const su = size_unit ? size_unit.toLowerCase().trim() : '';
  const sp = size_pack !== undefined && size_pack !== null ? parseInt(size_pack, 10) : '';
  return `${n}|${sv}|${su}|${sp}`;
}

export async function insertSupermarketData( supermarket_name, product_name, price, size_value = null, size_unit = null, size_pack = null, quantity = 1 ) {
  if (!supermarket_name) return null;
  if (!product_name) return null;

  const sv = size_value !== null ? parseFloat(size_value) : null;
  const su = size_unit ? size_unit.toLowerCase().trim() : null;
  const sp = size_pack !== null ? parseInt(size_pack, 10) : null;
  const qty = quantity !== null ? parseInt(quantity, 10) : 1;

  const existingProducts = await sql`
    SELECT * FROM supermarket 
    WHERE supermarket_name = ${supermarket_name} 
      AND LOWER(TRIM(product_name)) = LOWER(TRIM(${product_name}))
      AND (size_value IS NULL AND ${sv} IS NULL OR size_value = ${sv})
      AND (size_unit IS NULL AND ${su} IS NULL OR LOWER(TRIM(size_unit)) = ${su})
      AND (size_pack IS NULL AND ${sp} IS NULL OR size_pack = ${sp})
  `;

  if (existingProducts.length > 0) {
    const existing = existingProducts[0];
    if (parseFloat(existing.price) !== parseFloat(price) || parseInt(existing.quantity, 10) !== qty) {
      const updated = await sql`
        UPDATE supermarket 
        SET price = ${price}, quantity = ${qty}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existing.id} RETURNING *
      `;
      return updated[0];
    }
    return existing;
  } else {
    const newProduct = await sql`
      INSERT INTO supermarket (supermarket_name, product_name, price, size_value, size_unit, size_pack, quantity) 
      VALUES (${supermarket_name}, ${product_name}, ${price}, ${sv}, ${su}, ${sp}, ${qty}) RETURNING *
    `;
    return newProduct[0];
  }
}

export async function insertSupermarketDataBatch(supermarket_name, items) {
  if (!supermarket_name || !items || items.length === 0) return [];

  // Fetch all existing products for this supermarket in a single query
  const existingProducts = await sql`
    SELECT * FROM supermarket WHERE supermarket_name = ${supermarket_name}
  `;

  // Map by getProductUniqueKey
  const existingMap = new Map();
  for (const prod of existingProducts) {
    const key = getProductUniqueKey(prod.product_name, prod.size_value, prod.size_unit, prod.size_pack);
    existingMap.set(key, prod);
  }

  const dbOperations = [];

  for (const item of items) {
    if (!item.name) continue;
    const price = parseFloat(item.price.replace('£', ''));
    const itemNameClean = item.name.trim();

    const sv = item.size_value !== undefined && item.size_value !== null ? parseFloat(item.size_value) : null;
    const su = item.size_unit ? item.size_unit.toLowerCase().trim() : null;
    const sp = item.size_pack !== undefined && item.size_pack !== null ? parseInt(item.size_pack, 10) : null;
    const qty = item.quantity !== undefined && item.quantity !== null ? parseInt(item.quantity, 10) : 1;

    const key = getProductUniqueKey(itemNameClean, sv, su, sp);
    const existing = existingMap.get(key);

    if (existing) {
      if (parseFloat(existing.price) !== price || parseInt(existing.quantity, 10) !== qty) {
        dbOperations.push(
          sql`
            UPDATE supermarket 
            SET price = ${price}, quantity = ${qty}, updated_at = CURRENT_TIMESTAMP
            WHERE id = ${existing.id} RETURNING *
          `
        );
      }
    } else {
      dbOperations.push(
        sql`
          INSERT INTO supermarket (supermarket_name, product_name, price, size_value, size_unit, size_pack, quantity) 
          VALUES (${supermarket_name}, ${itemNameClean}, ${price}, ${sv}, ${su}, ${sp}, ${qty}) RETURNING *
        `
      );
    }
  }

  if (dbOperations.length > 0) {
    const results = await Promise.all(dbOperations);
    return results.flat();
  }

  return [];
}