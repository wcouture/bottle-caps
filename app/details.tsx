import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function Details() {
  const { index } = useLocalSearchParams();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Details Page.</Text>
      <Text>ID: {index}</Text>
    </View>
  );
}
