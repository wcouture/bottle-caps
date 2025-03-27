import { Button, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import { PieChart, pieDataItem } from "react-native-gifted-charts";
import { screenOptionsFactory } from "expo-router/build/useScreens";
import { Category } from "@/db/schema";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "@/db/schema";

export default function Index() {
  const [budgetUsed, setBudget] = useState(1500);

  const chartData = [
    { value: 1, text: "food" },
    { value: 2, text: "rent" },
    { value: 3, text: "utilities" },
  ];

  const [data, setData] = useState<Category[]>([]);

  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  useEffect(() => {
    const load = async () => {
      const data = await drizzleDb.query.categories.findMany();
      setData(data);
    };
    load();
  });

  return (
    <View
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
      <View>
        <PieChart
          donut
          strokeWidth={5}
          strokeColor="black"
          innerCircleBorderWidth={5}
          innerCircleBorderColor={"black"}
          showValuesAsLabels={true}
          showText
          textSize={18}
          textBackgroundRadius={22}
          textColor="white"
          textBackgroundColor="gray"
          labelsPosition="onBorder"
          showTextBackground={true}
          data={chartData}
          onPress={(item: pieDataItem, index: number) => {
            router.push({
              pathname: "/details",
              params: { index: index },
            });
          }}
        ></PieChart>
        {data.map((item) => (
          <Text key={item.id}>
            {item.name} : {item.limit}
          </Text>
        ))}
      </View>
    </View>
  );
}

const PieChartStyle = StyleSheet.create({
  piechart: {
    marginVertical: 100,
    marginHorizontal: 30,
    borderRadius: 10,
    paddingVertical: 50,
    backgroundColor: "#414141",
    justifyContent: "center",
    alignItems: "center",
  },
  available_label: {
    paddingTop: 20,
    paddingBottom: 50,
  },
});
