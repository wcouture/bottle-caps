import { Button, SafeAreaView, View } from "react-native";
import { Text, TextInput, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import DropDownPicker from "react-native-dropdown-picker";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { desc } from "drizzle-orm";
import * as schema from "@/db/schema";
import { Link, router, useNavigation } from "expo-router";

export default function AddPeriod() {
  const [label, setLabel] = useState("");

  const navigation = useNavigation();
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  const add_period = async () => {
    const periods = await drizzleDb.query.periods.findMany();
    const period = {
      id: periods.length + 1,
      label: label,
    };

    const result = await drizzleDb.insert(schema.periods).values(period);

    if (result.changes > 0) {
      const cats = await drizzleDb.query.categories.findMany();
      if (cats.length <= 0) {
        router.replace("/add-category");
        return;
      }
      router.dismissAll();
      router.replace("/");
    }
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
        </View>
        <Text
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            }
          }}
          style={styles.back_button}
        >
          back
        </Text>
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
    backgroundColor: "white",
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
    top: -50,
    fontStyle: "italic",
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
