import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

// Prisma 7 configuration. The CLI loads this file (independently of the app's
// CommonJS module system) to resolve the schema location and connection URL.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
