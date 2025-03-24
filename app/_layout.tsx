import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        <Stack.Screen name="index"></Stack.Screen>
        <Stack.Screen name="details"></Stack.Screen>
      </Stack>
    </ThemeProvider>
  );

  //<Stack screenOptions={{ headerShown: false }} />;
}
