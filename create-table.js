import sql from "./db.js";

sql`
  CREATE TABLE images (
      id SERIAL PRIMARY KEY,
      data BYTEA                  
  );
`.then(() => console.log('table created'));

// sql`
//   DROP TABLE images;
// `.then(() => console.log('table created'));