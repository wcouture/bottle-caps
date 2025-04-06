import { router, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { categories, Category, budget_entries, BudgetEntry } from "@/db/schema";
import * as schema from "@/db/schema";
import { Text, View, StyleSheet, Button, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { desc, asc, eq, and } from "drizzle-orm";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { BarChart, LineChart, lineDataItem } from "react-native-gifted-charts";

export default function Details() {
  const [entries, setEntries] = useState<BudgetEntry[]>([]);
  const [allEntries, setAllEntries] = useState<BudgetEntry[]>([]);
  const [chartData, setChartData] = useState<[]>([]);

  const { id } = useLocalSearchParams<{ id?: string }>();
  const category_id = parseInt(id ?? "0");

  const [categoryData, setCategoryData] = useState<Category[]>([]);
  const [category, setCategory] = useState<Category>();

  const [currentPeriod, setCurrentPeriod] = useState("No Current Period");
  const [currentPeriodID, setCurrentPeriodID] = useState(-1);

  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  const load_current_period = async () => {
    const periods = await drizzleDb
      .select()
      .from(schema.periods)
      .orderBy(desc(schema.periods.id));
    const period_id = periods[0].id;
    const period_label = periods[0].label;

    setCurrentPeriod(period_label);
    setCurrentPeriodID(period_id);
  };

  const load = async () => {
    const data = await drizzleDb
      .select()
      .from(categories)
      .where(eq(categories.id, category_id));
    setCategoryData(data);

    const entries = await drizzleDb
      .select()
      .from(budget_entries)
      .where(
        and(
          eq(budget_entries.category_id, category_id),
          eq(budget_entries.period_id, currentPeriodID)
        )
      );
    setEntries(entries);
  };

  const customLabel = (label: string) => {
    return (
      <View>
        <Text style={{ textAlign: "right", fontSize: 10 }}>{label}</Text>
      </View>
    );
  };

  const generateChartData = async () => {};
  const loadAllEntries = async () => {
    const all_entries = await drizzleDb
      .select()
      .from(schema.budget_entries)
      .orderBy(asc(schema.budget_entries.period_id));
    setAllEntries(all_entries);
  };

  useEffect(() => {
    load_current_period();
  }, []);

  useEffect(() => {
    load();
    loadAllEntries();
  }, [currentPeriodID]);

  useEffect(() => {
    setCategory(categoryData.at(0));
  }, [categoryData]);

  useEffect(() => {
    generateChartData();
  }, [entries]);

  return (
    <SafeAreaProvider>
      <SafeAreaView
        onPointerEnter={() => {
          load_current_period();
        }}
        style={styles.safe_area}
      >
        <Text style={styles.category_header}>{category?.name}</Text>
        <Text style={styles.period_label}>{currentPeriod}</Text>
        <ScrollView>
          <BarChart rotateLabel stackData={chartData} />
          {entries.map((item) => (
            <Text style={styles.budget_entry} key={item.id}>
              {item.label} - ${item.value}
            </Text>
          ))}
        </ScrollView>
        <Text style={styles.back_button} onPress={() => router.back()}>
          back
        </Text>
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
    fontSize: 32,
    fontWeight: 600,
    padding: 50,
    width: "100%",
    textAlign: "center",
    borderBottomColor: "grey",
  },

  budget_entry: {
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 5,
    padding: 15,
    marginTop: 20,
  },

  back_button: {
    color: "grey",
    top: -50,
  },

  period_label: {
    top: -50,
    color: "grey",
  },
});
