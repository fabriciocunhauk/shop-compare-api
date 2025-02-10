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

  const existingData = await sql`
    SELECT * FROM supermarket WHERE supermarket_name = ${supermarket_name} AND product_name = ${product_name} AND price = ${price}
  `;

  if (existingData.length === 0) {
    const supermarketData = await sql`
      INSERT INTO supermarket (supermarket_name, product_name, price) VALUES (${supermarket_name}, ${product_name}, ${price}) RETURNING *
    `;

    return supermarketData;
  } else {
    return existingData;
  }
}