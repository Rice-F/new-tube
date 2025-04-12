import dotenv from 'dotenv'; // 用于在node.js中加载环境变量的库
import { defineConfig } from 'drizzle-kit';

// dotenv.config()函数会读取.env文件中的变量，并将它们添加到process.env对象中
// 这使得在代码中可以通过process.env访问这些变量
dotenv.config({path: '.env'}); 

export default defineConfig({
  out: './drizzle', 
  schema: './src/db/schema.ts', 
  dialect: 'postgresql', 
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
