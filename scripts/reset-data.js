require('dotenv/config');

const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');

const sqlPath = path.join(process.cwd(), 'prisma', 'reset_data.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL belum tersedia.');
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 10000,
    statement_timeout: 30000,
  });

  await client.connect();

  try {
    await client.query(sql);
    console.log('Data operasional berhasil di-reset.');
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(`Reset data gagal: ${error.message}`);
  process.exit(1);
});
