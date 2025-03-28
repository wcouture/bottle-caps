import { useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { categories, Category } from "@/db/schema";
import * as schema from "@/db/schema";
import { Text, View } from "react-native";
import { useEffect, useState } from "react";
import { eq } from "drizzle-orm";

export default function Details() {
  const local_params = useLocalSearchParams();
  const cat_name = local_params.text.toString();

  const [data, setData] = useState<Category[]>([]);

  const db = useSQLiteContext();
  const drizzleDb = drizzle(db, { schema });

  useEffect(() => {
    const load = async () => {
      const data = await drizzleDb
        .select()
        .from(categories)
        .where(eq(categories.name, cat_name))
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
      <Text>ID: {cat_name}</Text>
      {data.map((item) => (
        <Text key={item.id}>
          {item.id} - {item.name} : {item.limit}
        </Text>
      ))}
    </View>
  );
}
