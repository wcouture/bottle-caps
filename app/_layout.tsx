import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { openDatabaseSync, SQLiteProvider } from "expo-sqlite";
import { Suspense, useEffect } from "react";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { ActivityIndicator } from "react-native";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "@/drizzle/migrations";
import { addDummyData } from "@/db/addDummyData";

export const DATABASE_NAME = "budget";

export default function RootLayout() {
  const expoDb = openDatabaseSync(DATABASE_NAME);
  const db = drizzle(expoDb);
  const { success, error } = useMigrations(db, migrations);

  useEffect(() => {
    if (success) {
    }
  }, [success]);

  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <SQLiteProvider
        databaseName={DATABASE_NAME}
        options={{ enableChangeListener: true }}
        useSuspense
      >
        <ThemeProvider value={DefaultTheme}>
          <Stack>
            <Stack.Screen
              name="index"
              options={{ headerShown: false }}
            ></Stack.Screen>
            <Stack.Screen
              name="details"
              options={{ headerShown: false }}
            ></Stack.Screen>
            <Stack.Screen
              name="add-expense"
              options={{ headerShown: false }}
            ></Stack.Screen>
            <Stack.Screen
              name="add-period"
              options={{ headerShown: false }}
            ></Stack.Screen>
            <Stack.Screen
              name="add-category"
              options={{ headerShown: false }}
            ></Stack.Screen>
          </Stack>
        </ThemeProvider>
      </SQLiteProvider>
    </Suspense>
  );
}
