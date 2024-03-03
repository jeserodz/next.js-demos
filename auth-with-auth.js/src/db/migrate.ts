import 'dotenv/config';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { db, client } from './client';

async function main() {
  console.log('🔄 Running migrations...');
  await migrate(db, { migrationsFolder: './src/db/migrations' });
  client.close();
  console.log('✅ Migrations completed!');
}

main();
