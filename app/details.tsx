import { router, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { categories, Category, budget_entries, BudgetEntry } from "@/db/schema";
import * as schema from "@/db/schema";
import { Text, View, StyleSheet, Button, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { eq } from "drizzle-orm";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function Details() {
  const [entries, setEntries] = useState<BudgetEntry[]>([]);

  const { id } = useLocalSearchParams<{ id?: string }>();
  const category_id = parseInt(id ?? "0");

  const [categoryData, setCategoryData] = useState<Category[]>([]);
  const [category, setCategory] = useState<Category>();

  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  useEffect(() => {
    const load = async () => {
      const data = await drizzleDb
        .select()
        .from(categories)
        .where(eq(categories.id, category_id));
      setCategoryData(data);

      const entries = await drizzleDb
        .select()
        .from(budget_entries)
        .where(eq(budget_entries.category_id, category_id));
      setEntries(entries);
    };

    load();
  }, []);

  useEffect(() => {
    setCategory(categoryData.at(0));
  }, [categoryData]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe_area}>
        <Text style={styles.back_button} onPress={() => router.back()}>
          return
        </Text>
        <Text style={styles.category_header}>{category?.name}</Text>
        <ScrollView>
          {entries.map((item) => (
            <Text style={styles.budget_entry} key={item.id}>
              {item.label} - ${item.value}
            </Text>
          ))}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe_area: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },

  category_header: {
    fontSize: 25,
    padding: 50,
  },

  budget_entry: {
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 5,
    padding: 15,
  },

  back_button: {
    position: "fixed",
    left: -150,
    top: 25,
    borderWidth: 0,
    borderColor: "black",
    borderRadius: 10,
    padding: 5,
    textDecorationLine: "underline",
  },
});
