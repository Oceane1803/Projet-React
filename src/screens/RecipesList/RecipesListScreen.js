import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableHighlight,
  Image,
  StyleSheet,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import axios from "axios";
import { getCategoryName } from "../../data/MockDataAPI";

export default function RecipesList() {
  const route = useRoute();
  const navigation = useNavigation();
  const { categoryId } = route.params || {};

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categoryId) return;

    axios
      .get("http://172.20.10.13:3000/recettes")
      .then((res) => {
        const filtered = res.data.filter(
          (recipe) => Number(recipe.id_categories) === Number(categoryId)
        );
        const formattedData = filtered.map((item) => ({
          recipeId: item.id_recettes,
          title: item.Nom,
          photo_url: item.image_url || "https://via.placeholder.com/150",
          categoryId: item.id_categories,
          description: item.Description,
        }));
        setRecipes(formattedData);
      })
      .catch((error) => {
        console.error("Erreur lors du chargement des recettes:", error);
      })
      .finally(() => setLoading(false));
  }, [categoryId]);

  const onPressRecipe = (item) => {
    navigation.navigate("Recipe", { id: item.recipeId, recipeName: item.title });
  };

  const renderRecipe = ({ item }) => (
    <TouchableHighlight
      underlayColor="rgba(73,182,77,0.9)"
      onPress={() => onPressRecipe(item)}
      style={styles.recipeItemContainer}
    >
      <View>
        <Image source={{ uri: item.photo_url }} style={styles.photo} />
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.category}>{getCategoryName(item.categoryId)}</Text>
        </View>
      </View>
    </TouchableHighlight>
  );

  if (!categoryId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Erreur : aucune catégorie sélectionnée</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={recipes}
          renderItem={renderRecipe}
          keyExtractor={(item) => item.recipeId.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  listContent: {
    paddingBottom: 20,
  },
  recipeItemContainer: {
    flex: 1,
    margin: 5,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f9f9f9",
    elevation: 3,
  },
  photo: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
  },
  infoContainer: {
    padding: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  category: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
    marginTop: 4,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "red",
  },
});
