import { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import AsyncStorage from "expo-sqlite/kv-store";
import { budget_entries, categories } from "./schema";

export const addDummyData = async (db: ExpoSQLiteDatabase) => {
  const value = AsyncStorage.getItemSync("dbInitialized");
  if (value) return;

  await db.delete(categories);

  console.log("Inserting entries");

  // await db.insert(categories).values([
  //   { name: "Food", limit: 100 },
  //   { name: "Rent", limit: 100 },
  //   { name: "Utilities", limit: 100 },
  // ]);
};
