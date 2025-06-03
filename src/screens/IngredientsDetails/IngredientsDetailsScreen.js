import React, { useLayoutEffect, useState, useEffect } from "react";
import {
  FlatList,
  Text,
  View,
  Image,
  TouchableHighlight,
  ActivityIndicator,
  Alert
} from "react-native";
import styles from "./styles";

export default function IngredientsDetailsScreen({ navigation, route }) {
  const recipeId = route.params?.recipeId;
  const recipeTitle = route.params?.title;
  const recipeImage = route.params?.image_url; // 👈 récupération de l'image passée depuis la page précédente

  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: recipeTitle || "Ingrédients",
      headerTitleStyle: { fontSize: 16 },
    });
  }, [recipeTitle]);

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(
        `http://172.20.10.13:3000/recettes/${recipeId}/ingredients`,
        {
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setIngredients(data);
      } else {
        setIngredients([]);
        console.warn("Données reçues non tableau:", data);
      }
    } catch (err) {
      setError(err.message);
      if (err.name !== "AbortError") {
        Alert.alert("Erreur", "Impossible de charger les ingrédients. Vérifiez votre connexion.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (recipeId) {
      fetchIngredients();
    } else {
      setError("ID de recette manquant");
      setLoading(false);
    }
  }, [recipeId]);

  const onPressIngredient = (ingredient) => {
    navigation.navigate("Ingredient", {
      ingredient: ingredient.id_ingredients,
      name: ingredient.Nom,
      image: recipeImage, // 👈 on passe l'image ici aussi pour qu'elle reste identique
    });
  };

  const renderIngredient = ({ item }) => (
    <TouchableHighlight
      underlayColor="rgba(73,182,77,0.9)"
      onPress={() => onPressIngredient(item)}
    >
      <View style={styles.container}>
        <Image
          style={styles.photo}
          source={{ uri: item.image_url || recipeImage || "https://via.placeholder.com/150" }}
          onError={(e) => console.log("Erreur chargement image:", e.nativeEvent.error)}
        />
        <Text style={styles.title}>{item.Nom || "Nom inconnu"}</Text>
        <Text style={{ color: "grey" }}>{item.Quantite || "Quantité non spécifiée"}</Text>
      </View>
    </TouchableHighlight>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center", flex: 1 }]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 10 }}>Chargement des ingrédients...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center", flex: 1 }]}>
        <Text style={{ color: "red", textAlign: "center", margin: 20 }}>Erreur: {error}</Text>
        <TouchableHighlight
          style={{ backgroundColor: "#007AFF", padding: 10, borderRadius: 5 }}
          onPress={fetchIngredients}
        >
          <Text style={{ color: "white" }}>Réessayer</Text>
        </TouchableHighlight>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={ingredients}
        keyExtractor={(item) => `ingredient_${item.id_ingredients}`}
        renderItem={renderIngredient}
        numColumns={3}
        contentContainerStyle={{ padding: 10 }}
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 }}>
            <Text>Aucun ingrédient trouvé pour cette recette.</Text>
          </View>
        }
      />
    </View>
  );
}
