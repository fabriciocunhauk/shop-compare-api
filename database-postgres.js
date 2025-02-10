import sql from './db.js'

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
