import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "@/db/schema";
import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import { Text, StyleSheet, TextInput, Button, View, Modal } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { eq } from "drizzle-orm";
import ColorPicker, {
  Panel1,
  Swatches,
  Preview,
  OpacitySlider,
  HueSlider,
  ColorFormatsObject,
} from "reanimated-color-picker";
import { hsvToColor } from "react-native-reanimated/lib/typescript/Colors";
import { Placeholder } from "drizzle-orm";

export default function AddCategory() {
  const [showModal, setShowModal] = useState(false);

  const [category_name, setCategoryName] = useState("");
  const [category_color, setCategoryColor] = useState("#000000");
  const [category_limit, setCategoryLimit] = useState("");

  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  const onSelectColor = (color: ColorFormatsObject) => {
    setCategoryColor(color.hex);
  };

  const submit_category = async () => {
    const cat_item = {
      id: Math.floor(Math.random() * 10000),
      name: category_name,
      limit: parseInt(category_limit),
      color: category_color,
    };

    var result = await drizzleDb
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.id, cat_item.id));

    while (result.length > 0) {
      cat_item.id = Math.floor(Math.random() * 10000);
      result = await drizzleDb
        .select()
        .from(schema.categories)
        .where(eq(schema.categories.id, cat_item.id));
    }

    try {
      // Submit category to DB
      const result = await drizzleDb.insert(schema.categories).values(cat_item);

      // If insertion was successful, return to home screen
      if (result.changes > 0) router.navigate("/");
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe_area}>
        <Text style={styles.page_header}>Add Budget Category</Text>

        <View style={styles.input_area}>
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

          <Text style={styles.input_label}>Category Color:</Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Text
              style={{
                width: 20,
                height: 20,
                borderWidth: 1,
                borderRadius: 10,
                backgroundColor: category_color,
              }}
            ></Text>
            <Text
              style={styles.color_button}
              onPress={() => {
                setShowModal(true);
              }}
            >
              Choose Color
            </Text>
          </View>

          <Text
            style={styles.submit_button}
            onPress={() => {
              submit_category();
            }}
          >
            Submit
          </Text>
          <Text onPress={() => router.back()} style={styles.back_button}>
            back
          </Text>
        </View>
        <Modal visible={showModal} animationType="slide">
          <ColorPicker
            style={{
              width: "70%",
              alignSelf: "center",
              top: "20%",
              paddingBottom: 5,
            }}
            value="red"
            onCompleteJS={onSelectColor}
          >
            <Preview />
            <Panel1 />
            <HueSlider />
            <Swatches style={{ top: 10 }} />
          </ColorPicker>

          <Text
            style={styles.color_picker_ok}
            onPress={() => {
              setShowModal(false);
            }}
          >
            Ok
          </Text>
        </Modal>
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
    justifyContent: "center",
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

  color_button: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 5,
    boxShadow: "1px 1px 3px 1px rgba(0,0,0,0.3)",
  },

  submit_button: {
    marginTop: 30,
    marginBottom: 5,
    fontSize: 18,
    borderWidth: 1,
    borderRadius: 10,
    padding: 8,
    boxShadow: "1px 1px 3px 1px rgba(0,0,0,0.3)",
  },

  color_picker_ok: {
    alignSelf: "center",
    top: "25%",
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 10,
    padding: 8,
    boxShadow: "1px 1px 3px 1px rgba(0,0,0,0.3)",
  },
});
