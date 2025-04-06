import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { Link, router } from "expo-router";
import { PieChart, pieDataItem } from "react-native-gifted-charts";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

interface CategoryItem {
  available: number;
  used: number;
  color: string;
  used_color: string;
  id: number;
  name: string;
}

interface Color {
  r: number;
  g: number;
  b: number;
}

function generateUsedColor(color: string): string {
  const saturation_scale = 5;

  var output = "#";
  const color_data = { r: 0, g: 0, b: 0 };
  const hex = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
  ];
  // Seg1
  const r = (hex.indexOf(color[1]) + 1) * 16 + (hex.indexOf(color[2]) + 1);
  color_data.r = r;

  // Seg 2
  const g = (hex.indexOf(color[3]) + 1) * 16 + (hex.indexOf(color[4]) + 1);
  color_data.g = g;

  // Seg 3
  const b = (hex.indexOf(color[5]) + 1) * 16 + (hex.indexOf(color[6]) + 1);
  color_data.b = b;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  // modify r
  if (min == r) color_data.r += 2 * saturation_scale;
  else if (max != r) color_data.r += 1 * saturation_scale;

  if (color_data.r > 255) color_data.r = 255;

  // modify g
  if (min == g) color_data.g += 2 * saturation_scale;
  else if (max != g) color_data.g += 1 * saturation_scale;

  if (color_data.g > 255) color_data.g = 255;

  // modify b
  if (min == b) color_data.b += 2 * saturation_scale;
  else if (max != b) color_data.b += 1 * saturation_scale;

  if (color_data.b > 255) color_data.b = 255;

  // RGB back to hex
  output += hex[Math.floor(color_data.r / 16)];
  output += hex[Math.floor(color_data.r % 16)];

  output += hex[Math.floor(color_data.g / 16)];
  output += hex[Math.floor(color_data.g % 16)];

  output += hex[Math.floor(color_data.b / 16)];
  output += hex[Math.floor(color_data.b % 16)];

  return output;
}

export default function Index() {
  const [budgetUsed, setBudgetUsed] = useState(0);
  const [budgetTotal, setBudgetTotal] = useState(0);

  // Used to supply and update piechart
  const [pieData, setPieData] = useState<pieDataItem[]>([]);
  // Used to store retrieved data from database
  const [categoryData, setCategoryData] = useState<CategoryItem[]>([]);

  const [currentPeriod, setCurrentPeriod] = useState("No Current Period");
  const [currentPeriodID, setCurrentPeriodID] = useState(-1);

  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  const load_current_period = async () => {
    const periods = await drizzleDb
      .select()
      .from(schema.periods)
      .orderBy(desc(schema.periods.id));

    const period = periods[0];
    const period_id = period?.id;
    const period_label = period?.label;

    setCurrentPeriod(period_label ?? "No Current Period");
    setCurrentPeriodID(period_id ?? -1);
  };

  const load_data = async () => {
    const data = await drizzleDb.query.categories.findMany();
    const category_data: CategoryItem[] = [];
    const budget = { total: 0, used: 0 };
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const cat_id = item.id;

      budget.total += item.limit;

      const cat_item: CategoryItem = {
        id: cat_id,
        used: 0,
        available: item.limit,
        name: item.name,
        color: item.color,
        used_color: generateUsedColor(item.color),
      };

      category_data.push(cat_item);
      setCategoryData(category_data);

      var budget_entries = await drizzleDb
        .select()
        .from(schema.budget_entries)
        .where(
          and(
            eq(schema.budget_entries.category_id, cat_id),
            eq(schema.budget_entries.period_id, currentPeriodID)
          )
        );

      for (let i = 0; i < budget_entries.length; i++) {
        const entry = budget_entries[i];
        cat_item.used += entry.value;
        cat_item.available -= entry.value;
      }

      budget.used += cat_item.used;
    }

    setBudgetTotal(budget.total);
    setBudgetUsed(budget.used);
  };

  const generate_chart_data = async () => {
    const chartData: pieDataItem[] = [];

    for (let i = 0; i < categoryData.length; i++) {
      let item = {
        value: categoryData[i].used,
        text: categoryData[i].name,
        color: categoryData[i].used_color,
      };
      chartData.push(item);

      let item2 = {
        value: categoryData[i].available,
        text: categoryData[i].name,
        color: categoryData[i].color,
      };
      chartData.push(item2);
    }
    setPieData(chartData);
  };

  useEffect(() => {
    load_current_period();
  }, []);

  useEffect(() => {
    if (currentPeriodID <= 0) return;

    load_data();
  }, [currentPeriodID]);

  useEffect(() => {
    // console.log("Budget: " + budgetUsed + "/" + budgetTotal);
    // console.log("Period: " + currentPeriod + " - " + currentPeriodID);
    generate_chart_data();
  }, [budgetTotal, budgetUsed, currentPeriod, currentPeriodID]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={PieChartStyle.safe_area}>
        <View style={PieChartStyle.period_label}>
          <Text style={PieChartStyle.period_inner_text}>{currentPeriod}</Text>
        </View>
        <View style={PieChartStyle.piechart}>
          <PieChart
            donut
            centerLabelComponent={() => {
              return (
                <View
                  style={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignContent: "center",
                  }}
                >
                  <View style={PieChartStyle.available_label}>
                    <Text style={PieChartStyle.used_label}>$ {budgetUsed}</Text>
                    <Text style={PieChartStyle.slash_label}>/</Text>
                    <Text style={PieChartStyle.total_label}>{budgetTotal}</Text>
                  </View>
                </View>
              );
            }}
            innerRadius={95}
            strokeWidth={0}
            strokeColor="black"
            innerCircleBorderWidth={0}
            innerCircleBorderColor={"black"}
            showValuesAsLabels={true}
            textSize={14}
            textBackgroundRadius={0}
            textColor="black"
            labelsPosition="outward"
            data={pieData}
            onPress={(item: pieDataItem, index: number) => {
              const data_index = Math.floor(index / 2);
              router.push({
                pathname: "/details",
                params: { id: categoryData[data_index].id },
              });
            }}
          ></PieChart>
          <View style={PieChartStyle.graph_key}>
            {pieData.map((cat_item, index) => {
              if (index % 2 == 0) {
                return;
              }
              const data_index = Math.floor(index / 2);
              const cat_id = categoryData[data_index].id;
              return (
                <Text
                  key={index}
                  style={{
                    width: "40%",
                    borderRightColor: pieData[index - 1].color,
                    borderBottomColor: pieData[index - 1].color,
                    borderColor: cat_item.color,
                    backgroundColor: "white",
                    borderWidth: 3,
                    textAlign: "center",
                    height: 30,
                    color: "#333",
                    fontWeight: 400,
                    padding: 5,
                    boxShadow: "1px 1px 5px 2px rgba(0,0,0,0.1)",
                  }}
                  onPress={() => {
                    router.navigate(`/details?id=${cat_id}`);
                  }}
                >
                  {cat_item.text}
                </Text>
              );
            })}
          </View>
        </View>
        <Link
          onPressIn={() => {}}
          style={PieChartStyle.nav_button}
          href={"/add-expense"}
        >
          Add Expense
        </Link>
        <Link style={PieChartStyle.nav_button} href={"/settings"}>
          Settings
        </Link>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const PieChartStyle = StyleSheet.create({
  safe_area: {
    backgroundColor: "white",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 50,
  },

  period_label: {
    top: -50,
  },

  period_inner_text: {
    fontSize: 18,
  },

  piechart: {
    marginBottom: 100,
    alignItems: "center",
  },

  page_header: {
    textDecorationLine: "underline",
    fontSize: 24,
    fontWeight: 300,
  },

  available_label: {
    fontSize: 25,
    fontWeight: 300,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },

  graph_key: {
    top: 50,
    padding: 10,
    display: "flex",
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
  },

  nav_button: {
    borderWidth: 1,
    fontSize: 18,
    padding: 10,
    borderRadius: 5,
    boxShadow: "1px 1px 5px 1px rgba(0,0,0,0.2)",
    margin: 10,
  },

  used_label: {
    fontSize: 22,
    top: 10,
    right: -10,
  },

  slash_label: {
    fontSize: 45,
    fontWeight: 200,
    color: "#AAA",
  },

  total_label: {
    fontSize: 25,
    top: 20,
    left: -10,
  },
});
