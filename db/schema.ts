import { boolean } from "drizzle-orm/gel-core";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const periods = sqliteTable("periods", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  label: text("label").notNull(),
});

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  limit: integer("limit").notNull(),
  color: text("color").notNull(),
});

export const budget_entries = sqliteTable("budget_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  value: integer("value").notNull(),
  label: text("label").notNull(),
  category_id: integer("category_id")
    .notNull()
    .references(() => categories.id),
  period_id: integer("period_id").references(() => periods.id),
});

export const previous_entries = sqliteTable("previous_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  value: integer("value").notNull(),
  label: text("label").notNull(),
  category_id: integer("category_id")
    .notNull()
    .references(() => categories.id),
  period_id: integer("period_id").references(() => periods.id),
});

export type BudgetEntry = typeof budget_entries.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Period = typeof periods.$inferSelect;
