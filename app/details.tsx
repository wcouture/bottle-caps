import { router, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import {
  categories,
  Category,
  budget_entries,
  BudgetEntry,
  Period,
} from "@/db/schema";
import * as schema from "@/db/schema";
import { Text, View, StyleSheet, Button, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { desc, asc, eq, and } from "drizzle-orm";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { BarChart, LineChart, lineDataItem } from "react-native-gifted-charts";

interface BarItem {
  value: number;
  label: string;
  id: number;
}

export default function Details() {
  const [entries, setEntries] = useState<BudgetEntry[]>([]);
  const [chartData, setChartData] = useState<BarItem[]>([]);

  const { id } = useLocalSearchParams<{ id?: string }>();
  const category_id = parseInt(id ?? "0");

  const [categoryData, setCategoryData] = useState<Category[]>([]);
  const [category, setCategory] = useState<Category>();

  const [budgetUsed, setBudgetUsed] = useState<number>(0);
  const [budgetLimit, setBudgetLimit] = useState<number>(0);

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

  const barTopLabel = (label: string) => {
    return (
      <View>
        <Text style={{ textAlign: "right", fontSize: 10 }}>{label}</Text>
      </View>
    );
  };

  const loadPreviousPeriods = async () => {
    const barData = [];

    const prev_periods = await drizzleDb.select().from(schema.periods).limit(6);
    for (let i = 0; i < prev_periods.length; i++) {
      const period = prev_periods[i];
      const bar_item = {
        value: 0,
        label: period.label,
        id: period.id,
        topLabelComponent: () => {},
      };

      const entries = await drizzleDb
        .select()
        .from(schema.budget_entries)
        .where(
          and(
            eq(schema.budget_entries.category_id, category?.id ?? -1),
            eq(schema.budget_entries.period_id, period.id)
          )
        );

      for (let j = 0; j < entries.length; j++) {
        bar_item.value += entries[j].value;
      }

      bar_item.topLabelComponent = () => {
        return barTopLabel(bar_item.value.toString());
      };

      barData.push(bar_item);

      if (bar_item.id == currentPeriodID) {
        setBudgetUsed(bar_item.value);
      }
    }

    setChartData(barData);
  };

  useEffect(() => {
    load_current_period();
  }, []);

  useEffect(() => {
    load();
  }, [currentPeriodID]);

  useEffect(() => {
    loadPreviousPeriods();
  }, [category]);

  useEffect(() => {
    setCategory(categoryData.at(0));
    setBudgetLimit(categoryData.at(0)?.limit ?? 0);
  }, [categoryData]);

  useEffect(() => {}, [entries]);

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
        <View style={styles.bar_chart_view}>
          <BarChart
            rotateLabel
            maxValue={(category?.limit ?? 0) * 1.5}
            barBorderRadius={4}
            xAxisThickness={0}
            yAxisColor={"grey"}
            noOfSections={4}
            onPress={(item: BarItem) => {
              setCurrentPeriodID(item.id);
              setCurrentPeriod(item.label);
            }}
            frontColor={category?.color}
            data={chartData}
          />
        </View>
        <Text style={styles.expenses_header}>Current Expenses:</Text>
        <Text style={styles.budget_status}>
          ${budgetUsed} / {budgetLimit}
        </Text>
        <ScrollView>
          {entries.map((item) => (
            <View style={styles.budget_entry} key={item.id}>
              <Text style={styles.entry_value}>${item.value}</Text>
              <Text>-</Text>
              <Text style={styles.entry_label}>{item.label}</Text>
            </View>
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
    width: "100%",
  },

  bar_chart_view: {
    paddingBottom: 50,
  },

  category_header: {
    fontSize: 32,
    fontWeight: 600,
    padding: 50,
    width: "100%",
    textAlign: "center",
    borderBottomColor: "grey",
  },

  expenses_header: {
    textDecorationLine: "underline",
    fontSize: 22,
  },

  budget_status: {
    color: "grey",
    fontSize: 18,
    paddingBottom: 10,
  },

  budget_entry: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    width: "100%",
    borderColor: "#BBB",
    borderBottomWidth: 1,
    borderTopWidth: 0,
    padding: 5,
  },

  entry_value: {
    width: "20%",
    textAlign: "center",
    fontSize: 18,
  },

  entry_label: {
    width: "35%",
    marginLeft: 15,
    fontSize: 18,
  },

  back_button: {
    fontStyle: "italic",
    color: "grey",
    top: -50,
  },

  period_label: {
    top: -50,
    color: "grey",
    fontSize: 18,
  },
});
