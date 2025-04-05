import { Button, SafeAreaView, View } from "react-native";
import { Text, TextInput, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import DropDownPicker from "react-native-dropdown-picker";
import { SQLiteRunResult, useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "@/db/schema";
import { router } from "expo-router";

export default function AddExpense() {
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([
    { label: "Apple", value: "apple" },
    { label: "Banana", value: "banana" },
  ]);

  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  const load_data = async () => {
    const data = await drizzleDb.query.categories.findMany();

    const items = [];

    for (let i = 0; i < data.length; i++) {
      let item = { value: data[i].id.toString(), label: data[i].name };
      items.push(item);
    }
    setItems(items);
  };

  const submit_expense = async () => {
    let cat_id = parseInt(value ?? "");
    const expense = {
      id: Math.round(Math.random() * 1000),
      value: parseInt(amount),
      label: label,
      category_id: cat_id,
      period_id: 573,
    };

    try {
      const result = await drizzleDb
        .insert(schema.budget_entries)
        .values(expense);

      if (result.changes > 0) router.back();
    } catch (ex) {
      console.log(ex);
    }
  };

  useEffect(() => {
    load_data();
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe_area}>
        <Text style={styles.page_header}>Add Expense</Text>
        <View style={styles.input_area}>
          <Text style={styles.input_label}>Label:</Text>
          <TextInput
            style={styles.input}
            value={label}
            onChangeText={setLabel}
          ></TextInput>
          <Text style={styles.input_label}>Category:</Text>
          <DropDownPicker
            open={open}
            value={value}
            items={items}
            setOpen={setOpen}
            setValue={setValue}
            setItems={setItems}
          />
          <Text style={styles.input_label}>Amount:</Text>
          <TextInput
            style={styles.input}
            value={amount}
            keyboardType="numeric"
            onChangeText={setAmount}
          ></TextInput>
          <Text
            style={styles.submit_button}
            onPress={() => {
              submit_expense();
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
    padding: 10,
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
    top: 150,
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
