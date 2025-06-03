import React, { useEffect, useState } from 'react';
import { FlatList, Text, View, Image, TouchableHighlight, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

export default function CategoriesScreen() {
  const [categoriesWithImages, setCategoriesWithImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Récupérer toutes les catégories
        const categoriesResponse = await axios.get('http://172.20.10.13:3000/categories');
        const categories = categoriesResponse.data;

        // 2. Récupérer toutes les recettes
        const recipesResponse = await axios.get('http://172.20.10.13:3000/recettes');
        const recipes = recipesResponse.data;

        // 3. Construire la liste des catégories avec l'image de la première recette associée
        const categoriesWithImages = categories.map(category => {
          // Trouver la première recette qui a le même id_categories
          const recipeForCategory = recipes.find(r => Number(r.id_categories) === Number(category.id_categories));

          return {
            ...category,
            image_url: recipeForCategory && recipeForCategory.image_url
              ? recipeForCategory.image_url
              : 'https://via.placeholder.com/150', // image par défaut
          };
        });

        setCategoriesWithImages(categoriesWithImages);
      } catch (error) {
        console.error('Erreur lors du chargement des données :', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const onPressCategory = (item) => {
    navigation.navigate('RecipesList', { categoryId: item.id_categories, categoryName: item.Nom });
  };

  const renderCategory = ({ item }) => (
    <TouchableHighlight
      underlayColor="rgba(73,182,77,0.9)"
      onPress={() => onPressCategory(item)}
      style={styles.categoryItemContainer}
    >
      <View style={styles.categoryContainer}>
        <Image
          style={styles.categoryImage}
          source={{ uri: item.image_url }}
          onError={() => {
            // En cas d'erreur, afficher image par défaut
            item.image_url = 'https://via.placeholder.com/150';
          }}
        />
        <Text style={styles.categoryName}>{item.Nom}</Text>
        <Text style={styles.categoryDescription}>Recettes disponibles: {item.recipe_count || 0}</Text>
      </View>
    </TouchableHighlight>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={categoriesWithImages}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id_categories.toString()}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  listContainer: {
    paddingHorizontal: 10,
  },
  categoryItemContainer: {
    width: '100%',
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  categoryContainer: {
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    overflow: 'hidden',
  },
  categoryImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 10,
  },
  categoryDescription: {
    fontSize: 14,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
});
