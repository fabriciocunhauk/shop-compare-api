import sql from "./db.js";

// sql`
//   CREATE TABLE images (
//       id SERIAL PRIMARY KEY,
//       data BYTEA                  
//   );
// `.then(() => console.log('table created'));

sql`
  CREATE TABLE supermarket (
      id SERIAL PRIMARY KEY,
      supermarket_name VARCHAR(255) NOT NULL,
      product_name VARCHAR(255) NOT NULL,
      price VARCHAR(10) NOT NULL          
  );
`.then(() => console.log('table created'));

// sql`
//   DROP TABLE images;
// `.then(() => console.log('table created'));