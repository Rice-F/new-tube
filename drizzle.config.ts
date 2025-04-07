import dotenv from 'dotenv'; // 用于在node.js中加载环境变量的库
import { defineConfig } from 'drizzle-kit';

dotenv.config({path: '.env.local'});

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
