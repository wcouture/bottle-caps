import { Link, router } from "expo-router";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { BackHandler, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useSQLiteContext } from "expo-sqlite";
import * as schema from "@/db/schema";
import { navigate } from "expo-router/build/global-state/routing";

export default function Settings() {
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  const clearData = async () => {
    await drizzleDb.delete(schema.categories);
    await drizzleDb.delete(schema.budget_entries);
    await drizzleDb.delete(schema.periods);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.page_view}>
        <Text style={styles.page_header}>Settings</Text>
        <View style={styles.settings_view}>
          <Link style={styles.nav_button} href="/add-category">
            Add Category
          </Link>
          <Link style={styles.nav_button} href="/add-period">
            Add Budget Period
          </Link>
          <Text style={styles.nav_button} onPress={clearData}>
            Clear Data
          </Text>
        </View>
        <Text style={styles.back_button} onPress={() => router.back()}>
          back
        </Text>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  page_view: {
    width: "85%",
    marginLeft: "auto",
    marginRight: "auto",
  },
  page_header: {
    fontSize: 24,
    textAlign: "center",
    top: 50,
    zIndex: 1,
  },
  settings_view: {
    top: -100,
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  nav_button: {
    textAlign: "center",
    borderWidth: 1,
    fontSize: 18,
    padding: 10,
    borderRadius: 5,
    boxShadow: "1px 1px 5px 1px rgba(0,0,0,0.2)",
    margin: 10,
  },
  back_button: {
    top: -150,
    width: "100%",
    textAlign: "center",
    color: "grey",
    fontStyle: "italic",
  },
});
