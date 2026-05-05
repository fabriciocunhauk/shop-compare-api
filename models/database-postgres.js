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