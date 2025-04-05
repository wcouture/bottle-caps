import { Button, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { Link, RelativePathString, router } from "expo-router";
import { PieChart, pieDataItem } from "react-native-gifted-charts";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
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
  const [budgetUsed, setBudget] = useState(1500);

  // Used to supply and update piechart
  const [pieData, setPieData] = useState<pieDataItem[]>([]);
  // Used to store retrieved data from database
  const [data, setData] = useState<CategoryItem[]>([]);

  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  const clear_db = async () => {
    const data = await drizzleDb.delete(schema.categories);
    await drizzleDb.delete(schema.budget_entries);
    await drizzleDb.delete(schema.periods);
    setData([]);
    setPieData;
  };

  const load_data = async () => {
    const data = await drizzleDb.query.categories.findMany();
    const category_data: CategoryItem[] = [];
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const cat_id = item.id;

      const cat_item: CategoryItem = {
        id: cat_id,
        used: 0,
        available: item.limit,
        name: item.name,
        color: item.color,
        used_color: generateUsedColor(item.color),
      };

      category_data.push(cat_item);
      setData(category_data);

      try {
        const budget_entries = await drizzleDb
          .select()
          .from(schema.budget_entries)
          .where(eq(schema.budget_entries.category_id, cat_id));

        for (let i = 0; i < budget_entries.length; i++) {
          const entry = budget_entries[i];
          cat_item.used += entry.value;
          cat_item.available -= entry.value;
        }
      } catch (e) {
        console.log(e);
      }
    }

    const chartData: pieDataItem[] = [];

    for (let i = 0; i < category_data.length; i++) {
      let item = {
        value: category_data[i].used,
        text: category_data[i].name + "(-)",
        color: category_data[i].used_color,
      };
      chartData.push(item);

      let item2 = {
        value: category_data[i].available,
        text: category_data[i].name + "(+)",
        color: category_data[i].color,
      };
      chartData.push(item2);
    }
    setPieData(chartData);
  };

  useEffect(() => {
    load_data();
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={PieChartStyle.safe_area}>
        <Text style={PieChartStyle.page_header}>Available Budget</Text>
        <Text style={PieChartStyle.available_label}>$ {budgetUsed} / 2500</Text>
        <View style={PieChartStyle.piechart}>
          <PieChart
            donut
            strokeWidth={2}
            strokeColor="black"
            innerCircleBorderWidth={2}
            innerCircleBorderColor={"black"}
            showValuesAsLabels={true}
            textSize={14}
            textBackgroundRadius={22}
            textColor="black"
            labelsPosition="outward"
            data={pieData}
            onPress={(item: pieDataItem, index: number) => {
              const data_index = Math.floor(index / 2);
              router.push({
                pathname: "/details",
                params: { id: data[data_index].id },
              });
            }}
          ></PieChart>
          <View style={PieChartStyle.graph_key}>
            {pieData.map((cat_item, index) => {
              const data_index = Math.floor(index / 2);
              const cat_id = data[data_index].id;
              return (
                <Text
                  key={index}
                  style={{
                    width: "35%",
                    backgroundColor: cat_item.color,
                    textAlign: "center",
                    height: 25,
                    color: "white",
                    fontWeight: 800,
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
        <Link style={PieChartStyle.nav_button} href={"/add-expense"}>
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
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 50,
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
    paddingTop: 20,
    paddingBottom: 50,
    fontSize: 16,
    fontWeight: 300,
  },

  graph_key: {
    padding: 10,
    display: "flex",
    flexDirection: "row",
    rowGap: 10,
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
});
