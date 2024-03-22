# Next.js Demos - Database SQLite

This is a example of how to use Drizzle ORM to use a SQLite database in Next.js

## References

- Getting Started (Drizzle ORM): https://orm.drizzle.team/docs/get-started-sqlite
- Migrations (Drizzle Kit): https://orm.drizzle.team/kit-docs/overview
- Studio (Drizzle Kit): https://orm.drizzle.team/drizzle-studio/overview

## Setup

### 1. Install the libraries

```bash
npm i drizzle-orm @libsql/client
npm i -D drizzle-kit dotenv ts-node
```

### 2. Create the DB client `src/db/client.ts`

```typescript
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

export const client = createClient({
  url: String(process.env.DATABASE_URL),
  authToken: String(process.env.DATABASE_AUTH_TOKEN),
});

export const db = drizzle(client, { schema });
```

### 3. Create the schema `src/db/schema.ts`

```typescript
import { text, sqliteTable } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').notNull().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
});
```

### 4. Create the migrations config `src/db/config.ts`

```typescript
import 'dotenv/config';
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  driver: 'turso',
  dbCredentials: {
    url: String(process.env.DATABASE_URL),
    authToken: String(process.env.DATABASE_AUTH_TOKEN),
  },
} satisfies Config;
```

### 5. Create the migration script `src/db/migrate.ts`

```typescript
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
```

### 6. Add migration commands to `package.json`

```json
{
  "scripts": {
    "db:migration:generate": "drizzle-kit generate:sqlite --config=src/db/config.ts",
    "db:migration:run": "ts-node src/db/migrate.ts",
    "db:studio": "drizzle-kit studio --config=src/db/config.ts"
  }
}
```

### 7. Add `ts-node` compiler configs to `tsconfig.json`

This is needed to allow using `import` statements in the migration script.

```json
{
  "ts-node": {
    "compilerOptions": {
      "module": "commonjs"
    }
  }
}
```

### 8. Add the environment variables

```bash
DATABASE_URL=file:src/db/db.sqlite
DATABASE_AUTH_TOKEN=token
```

### 9. Test it

```bash
npm run db:migration:generate
npm run db:migration:run
npm run db:studio
```
