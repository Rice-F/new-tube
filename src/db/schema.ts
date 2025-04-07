import { integer, pgTable, text, timestamp, uniqueIndex, uuid,  varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").unique().notNull(),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updateAt: timestamp("update_at").defaultNow().notNull(),
}, t=> [uniqueIndex("clerk_id_idx").on(t.clerkId)]);
