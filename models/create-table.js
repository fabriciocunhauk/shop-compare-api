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
      price NUMERIC(10, 2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
  );
`.then(() => console.log('table created'));

// sql`
//   DROP TABLE supermarket;
// `.then(() => console.log('table deleted'));