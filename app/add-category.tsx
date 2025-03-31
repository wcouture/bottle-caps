import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "@/db/schema";
import { useSQLiteContext } from "expo-sqlite";
import React, { useState } from "react";
import { Text, StyleSheet, TextInput, Button } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useLinkProps } from "@react-navigation/native";

export default function AddCategory() {
  const [category_name, setCategoryName] = useState("");
  const [category_limit, setCategoryLimit] = useState("");

  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  const submit_category = async () => {
    const cat_item = {
      id: Math.floor(Math.random() * 10000),
      name: category_name,
      limit: parseInt(category_limit),
    };

    // Submit category to DB
    const result = await drizzleDb.insert(schema.categories).values(cat_item);
    // If insertion was successful, return to home screen
    if (result.changes > 0) router.navigate("/");
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView>
        <Text style={styles.input_label}>Category Name:</Text>
        <TextInput
          value={category_name}
          style={styles.input}
          onChangeText={setCategoryName}
        ></TextInput>
        <Text style={styles.input_label}>Category Limit:</Text>
        <TextInput
          value={category_limit}
          style={styles.input}
          onChangeText={setCategoryLimit}
          keyboardType="numeric"
        ></TextInput>
        <Button
          title="Submit"
          onPress={() => {
            submit_category();
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
