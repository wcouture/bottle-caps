import { Button, StyleSheet, Text, View } from "react-native";
import React from "react";
import { router } from "expo-router";
import { PieChart, pieDataItem } from "react-native-gifted-charts";
import { screenOptionsFactory } from "expo-router/build/useScreens";

const data = [
  { value: 80, color: "#ff5252" },
  { value: 60, color: "#52aeff" },
  { value: 90, color: "#ffdc52" },
  { value: 40, color: "#57d945" },
];

export default function Index() {
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
      <Text style={PieChartStyle.available_label}>$ 1594 / 2500</Text>
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
          data={data}
          onPress={(item: pieDataItem, index: number) => {
            router.push({
              pathname: "/details",
              params: { index: index },
            });
          }}
        ></PieChart>
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
