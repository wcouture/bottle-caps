import { useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { categories, Category } from "@/db/schema";
import * as schema from "@/db/schema";
import { Text, View } from "react-native";
import { useEffect, useState } from "react";
import { eq } from "drizzle-orm";

export default function Details() {
  const { index } = useLocalSearchParams();

  const [data, setData] = useState<Category[]>([]);

  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  useEffect(() => {
    const load = async () => {
      const data = drizzleDb
        .select()
        .from(categories)
        .where(eq(categories.id, parseInt(index[0])))
        .all();
      setData(data);
    };

    load();
  });

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
