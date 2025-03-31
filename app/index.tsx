import { Button, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import { PieChart, pieDataItem } from "react-native-gifted-charts";
import { screenOptionsFactory } from "expo-router/build/useScreens";
import { Category } from "@/db/schema";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "@/db/schema";
import { char } from "drizzle-orm/mysql-core";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const [budgetUsed, setBudget] = useState(1500);

  // Used to supply and update piechart
  const [pieData, setPieData] = useState<pieDataItem[]>([]);
  // Used to store retrieved data from database
  const [data, setData] = useState<Category[]>([]);

  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  const clear_db = async () => {
    const data = await drizzleDb.delete(schema.categories);
    setData([]);
    setPieData;
  };

  const load_data = async () => {
    const data = await drizzleDb.query.categories.findMany();
    setData(data);

    const chartData: pieDataItem[] = [];

    for (let i = 0; i < data.length; i++) {
      let item = { value: data[i].limit, text: data[i].name };
      chartData.push(item);
    }
    setPieData(chartData);
  };

  useEffect(() => {
    load_data();
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "flex-start",
          alignItems: "center",
          padding: 50,
        }}
      >
        <Text
          style={{
            textDecorationLine: "underline",
            fontSize: 20,
            fontFamily: "courier new",
          }}
        >
          Available Budget
        </Text>
        <Text style={PieChartStyle.available_label}>$ {budgetUsed} / 2500</Text>
        <View style={PieChartStyle.piechart}>
          <PieChart
            donut
            strokeWidth={5}
            strokeColor="black"
            innerCircleBorderWidth={5}
            innerCircleBorderColor={"black"}
            showValuesAsLabels={true}
            showText
            textSize={14}
            textBackgroundRadius={22}
            textColor="black"
            labelsPosition="outward"
            data={pieData}
            onPress={(item: pieDataItem, index: number) => {
              router.push({
                pathname: "/details",
                params: { text: item.text },
              });
            }}
          ></PieChart>
        </View>
        <Button
          title="Add Category"
          onPress={() => {
            router.push({
              pathname: "/add-category",
            });
          }}
        />
        <Button title="Clear DB" onPress={clear_db} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const PieChartStyle = StyleSheet.create({
  piechart: {
    marginBottom: 100,
  },
  available_label: {
    paddingTop: 20,
    paddingBottom: 50,
  },

  clear_button: {},
  add_category: { padding: 10, borderWidth: 2, color: "#000" },
});
