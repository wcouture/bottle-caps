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

export default function Index() {
  const [budgetUsed, setBudget] = useState(1500);
  const [pieData, setPieData] = useState<pieDataItem[]>([]);

  const chartData: pieDataItem[] = [];

  const [data, setData] = useState<Category[]>([]);

  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  const clear_db = async () => {
    const data = await drizzleDb.delete(schema.categories);
    setData([]);
  };

  useEffect(() => {
    const load = async () => {
      const data = await drizzleDb.query.categories.findMany();
      setData(data);

      for (let i = 0; i < data.length; i++) {
        let item = { value: Math.random() * 100, text: data[i].name };
        chartData.push(item);
      }
      setPieData(chartData);
    };
    load();
  }, []);

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
          data={pieData}
          onPress={(item: pieDataItem, index: number) => {
            router.push({
              pathname: "/details",
              params: { text: item.text },
            });
          }}
        ></PieChart>
        <Button title="Clear DB" onPress={clear_db} />
        {data.map((item) => (
          <Text key={item.id}>
            {item.id} - {item.name} : {item.limit}
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
