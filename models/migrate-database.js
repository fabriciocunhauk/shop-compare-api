import sql from './db.js';

async function runMigration() {
  console.log('⚡ Starting database migration...');

  try {
    // 1. Add size_value column (NUMERIC with 3 decimal places to support kilograms e.g. 0.250 kg)
    console.log('  Adding size_value column...');
    await sql`ALTER TABLE supermarket ADD COLUMN IF NOT EXISTS size_value NUMERIC(10, 3)`;

    // 2. Add size_unit column (VARCHAR(50) for units like g, kg, ml, l, pt)
    console.log('  Adding size_unit column...');
    await sql`ALTER TABLE supermarket ADD COLUMN IF NOT EXISTS size_unit VARCHAR(50)`;

    // 3. Add size_pack column (INTEGER for pack sizes e.g. 4, 6, 24)
    console.log('  Adding size_pack column...');
    await sql`ALTER TABLE supermarket ADD COLUMN IF NOT EXISTS size_pack INTEGER`;

    // 4. Add quantity column (INTEGER for scanned purchase quantities, defaulting to 1)
    console.log('  Adding quantity column...');
    await sql`ALTER TABLE supermarket ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1`;

    // 5. Handle optional table reset/truncation
    const args = process.argv.slice(2);
    if (args.includes('--reset') || args.includes('-r')) {
      console.log('  ⚠️ --reset flag detected: Truncating supermarket table...');
      await sql`TRUNCATE TABLE supermarket`;
      console.log('  🗑  Table truncated successfully!');
    }

    console.log('✨ Migration completed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

runMigration();
