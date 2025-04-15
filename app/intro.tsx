import { Mulish_300Light, useFonts } from "@expo-google-fonts/mulish";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native";
import { PieChart, pieDataItem } from "react-native-gifted-charts";
import { router } from "expo-router";
import { useSharedValue } from "react-native-reanimated";
import { useEffect, useState } from "react";

export default function Intro() {
  const [loaded, error] = useFonts({ Mulish_300Light });
  const [counter, setCounter] = useState(0);
  const [pieData, setPieData] = useState<pieDataItem[]>([
    { value: Math.random() * 100 + 200, color: "#4287f5" },
    { value: Math.random() * 100 + 200, color: "#356fcc" },
    { value: Math.random() * 100 + 200, color: "#e0c84c" },
    { value: Math.random() * 100 + 200, color: "#c4af43" },
    { value: Math.random() * 100 + 200, color: "#47e657" },
    { value: Math.random() * 100 + 200, color: "#39bd46" },
  ]);

  useEffect(() => {
    if (counter < 100) {
      setCounter(counter + 1);
      return;
    }
    console.log("Counter Reset");
    setCounter(0);

    const data = pieData;
    for (let i = 0; i < data.length; i++) {
      data[i].value += (Math.floor(Math.random() * 3) - 1) * 100;
    }
    setPieData(data);
  }, [pieData]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe_area}>
        <View style={styles.header_area}>
          <Text style={styles.header_top}>Welcome to</Text>
          <Text style={styles.header}>bottlecaps</Text>
          <Text style={styles.sub_header}>Budgeting made easy.</Text>
        </View>
        <View style={styles.example_chart}>
          <PieChart
            innerRadius={95}
            data={pieData}
            centerLabelComponent={() => {
              return (
                <View>
                  <Text style={{ fontSize: 64, fontFamily: "mulish" }}>$</Text>
                </View>
              );
            }}
            donut
          ></PieChart>
        </View>
        <View style={styles.continue_area}>
          <Text>Start by making your first budgeting period...</Text>
          <Text
            onPress={() => {
              router.dismissAll();
              router.replace("/add-period");
            }}
            style={styles.continue_button}
          >
            CONTINUE
          </Text>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe_area: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    height: "100%",
    backgroundColor: "white",
  },
  header_area: {
    display: "flex",
    justifyContent: "center",
    paddingTop: 40,
  },
  header: {
    fontSize: 48,
    textAlign: "left",
    fontFamily: "mulish",
    fontWeight: 300,
    wordWrap: "wrap",
  },
  header_top: {
    fontSize: 32,
    fontFamily: "mulish",
  },
  sub_header: {
    textAlign: "left",
    width: "50%",
    fontSize: 16,
    fontWeight: 300,
    fontFamily: "mulish",
  },

  example_chart: {
    marginTop: 100,
  },

  continue_area: {
    paddingTop: "35%",
    backgroundColor: "white",
    width: "80%",
  },
  continue_button: {
    textAlign: "center",
    borderWidth: 1,
    width: "50%",
    padding: 5,
    borderRadius: 10,
    top: 20,
    alignSelf: "center",
  },
});
