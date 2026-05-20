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

export async function insertSupermarketData( supermarket_name, product_name, price ) {
  if (!supermarket_name) return null;
  if (!product_name) return null;

  const existingProducts = await sql`
    SELECT * FROM supermarket WHERE supermarket_name = ${supermarket_name} AND product_name = ${product_name}
  `;

  if (existingProducts.length > 0) {
    const existing = existingProducts[0];
    if (parseFloat(existing.price) !== parseFloat(price)) {
      // Update the price to the new one
      const updated = await sql`
        UPDATE supermarket SET price = ${price}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existing.id} RETURNING *
      `;
      return updated;
    } else {
      // Price is the same, no action needed
      return existing;
    }
  } else {
    // Insert new product
    const newProduct = await sql`
      INSERT INTO supermarket (supermarket_name, product_name, price) VALUES (${supermarket_name}, ${product_name}, ${price}) RETURNING *
    `;
    return newProduct;
  }
}

export async function insertSupermarketDataBatch(supermarket_name, items) {
  if (!supermarket_name || !items || items.length === 0) return [];

  // Fetch all existing products for this supermarket in a single query
  const existingProducts = await sql`
    SELECT * FROM supermarket WHERE supermarket_name = ${supermarket_name}
  `;

  // Map by product_name (lowercase trimmed for case-insensitive safe lookup)
  const existingMap = new Map();
  for (const prod of existingProducts) {
    existingMap.set(prod.product_name.toLowerCase().trim(), prod);
  }

  const dbOperations = [];

  for (const item of items) {
    if (!item.name) continue;
    const price = parseFloat(item.price.replace('£', ''));
    const itemNameClean = item.name.trim();
    const existing = existingMap.get(itemNameClean.toLowerCase());

    if (existing) {
      if (parseFloat(existing.price) !== price) {
        dbOperations.push(
          sql`
            UPDATE supermarket 
            SET price = ${price}, updated_at = CURRENT_TIMESTAMP
            WHERE id = ${existing.id} RETURNING *
          `
        );
      }
    } else {
      dbOperations.push(
        sql`
          INSERT INTO supermarket (supermarket_name, product_name, price) 
          VALUES (${supermarket_name}, ${itemNameClean}, ${price}) RETURNING *
        `
      );
    }
  }

  if (dbOperations.length > 0) {
    // Run all insert/update operations concurrently via connection pool
    const results = await Promise.all(dbOperations);
    return results.flat();
  }

  return [];
}