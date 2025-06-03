import React, { useLayoutEffect, useState, useEffect } from "react";
import { FlatList, Text, View, TouchableHighlight, Image } from "react-native";
import styles from "./styles";
import MenuImage from "../../components/MenuImage/MenuImage";
import { getCategoryName } from "../../data/MockDataAPI";

export default function HomeScreen(props) {
  const { navigation } = props;
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <MenuImage
          onPress={() => {
            navigation.openDrawer();
          }}
        />
      ),
      headerRight: () => <View />,
    });
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const response = await fetch("http://172.20.10.13:3000/recettes");
      const json = await response.json();
      const formattedData = json.map((item) => ({
        recipeId: item.id_recettes,
        title: item.Nom,
        photo_url: item.image_url ?? "https://via.placeholder.com/150",
        categoryId: item.id_categories,
      }));
      setRecipes(formattedData);
    } catch (error) {
      console.error("Erreur lors du chargement des recettes :", error);
    } finally {
      setLoading(false);
    }
  };

  const onPressRecipe = (item) => {
    navigation.navigate("Recipe", { id: item.recipeId });
  };

  const renderRecipes = ({ item }) => (
    <TouchableHighlight underlayColor="rgba(73,182,77,0.9)" onPress={() => onPressRecipe(item)}>
      <View style={styles.container}>
        <Image style={styles.photo} source={{ uri: item.photo_url }} />
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.category}>{getCategoryName(item.categoryId)}</Text>
      </View>
    </TouchableHighlight>
  );

  return (
    <View>
      {!loading && (
        <FlatList
          vertical
          showsVerticalScrollIndicator={false}
          numColumns={2}
          data={recipes}
          renderItem={renderRecipes}
          keyExtractor={(item) => `${item.recipeId}`}
        />
      )}
    </View>
  );
}