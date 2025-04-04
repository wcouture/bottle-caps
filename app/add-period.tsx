import { Button, SafeAreaView, View } from "react-native";
import { Text, TextInput, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import DropDownPicker from "react-native-dropdown-picker";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "@/db/schema";
import { router } from "expo-router";

export default function AddPeriod() {
  const [label, setLabel] = useState("");

  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  const add_period = async () => {
    const period = {
      id: Math.round(Math.random() * 1000),
      label: label,
    };

    console.log(period);

    const result = await drizzleDb.insert(schema.periods).values(period);

    if (result.changes > 0) router.navigate("/");
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe_area}>
        <Text style={styles.page_header}>Add Budget Period</Text>

        <View style={styles.input_area}>
          <Text style={styles.input_label}>Label:</Text>
          <TextInput
            style={styles.input}
            value={label}
            onChangeText={setLabel}
          ></TextInput>
          <Text
            style={styles.submit_button}
            onPress={() => {
              add_period();
            }}
          >
            Submit
          </Text>
          <Text onPress={() => router.back()} style={styles.back_button}>
            back
          </Text>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  input: {
    width: "100%",
    height: 40,
    borderWidth: 1,
    paddingLeft: 10,
    paddingRight: 10,
  },

  input_label: {
    width: "95%",
    fontSize: 18,
  },

  safe_area: {
    width: "100%",
    flex: 1,
    alignItems: "center",
    marginLeft: "auto",
    marginRight: "auto",
  },

  input_area: {
    width: "60%",
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    top: "25%",
  },

  page_header: {
    fontSize: 24,
    padding: 20,
    top: 35,
  },

  back_button: {
    color: "grey",
  },

  submit_button: {
    marginTop: 30,
    marginBottom: 5,
    fontSize: 18,
    borderWidth: 1,
    borderRadius: 10,
    padding: 8,
  },
});
