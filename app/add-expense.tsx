import { Button, SafeAreaView } from "react-native";
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

    console.log(expense);

    try {
      const result = await drizzleDb
        .insert(schema.budget_entries)
        .values(expense);
      console.log("Finished db request");

      if (result.changes > 0) router.navigate("/");
    } catch (ex) {
      console.log(ex);
    }
  };

  useEffect(() => {
    load_data();
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView>
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
        <Button
          title="Submit"
          onPress={() => {
            submit_expense();
          }}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },

  input_label: {
    padding: 10,
  },
});
