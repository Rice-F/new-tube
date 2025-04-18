import { pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(), // UUID类型，主键，默认值为随机生成
  clerkId: text("clerk_id").unique().notNull(), // 唯一且不能为空
  name: text("name").notNull(), 
  imageUrl: text("image_url").notNull(), 
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updateAt: timestamp("update_at").defaultNow().notNull(),
}, t=> [uniqueIndex("clerk_id_idx").on(t.clerkId)]); // 唯一索引，搜索优化

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updateAt: timestamp("update_at").defaultNow().notNull(),
}, t => [uniqueIndex("name_idx").on(t.name)]);