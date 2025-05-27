import React, { useState, useEffect } from 'react';
import { FlatList, Text, View, Image, TouchableHighlight, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

export default function App() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    axios.get('http://192.168.43.78:3000/categories')
      .then(response => {
        console.log("Données reçues:", response.data);
        setCategories(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des catégories:', error);
        setLoading(false);
      });
  }, []);

  const onPressCategory = (item) => {
    console.log("Catégorie sélectionnée:", item.Nom);
    navigation.navigate('RecipesList', { categoryId: item.id_categories, categoryName: item.Nom });
  };

  const renderCategory = ({ item }) => {
    const imageUrl = item.photo_url || "https://via.placeholder.com/150";
    return (
      <TouchableHighlight 
        underlayColor="rgba(73,182,77,0.9)" 
        onPress={() => onPressCategory(item)}
        style={styles.categoryItemContainer}
      >
        <View style={styles.categoryContainer}>
          <Image 
            style={styles.categoryImage} 
            source={{ uri: imageUrl }}
            onError={(e) => console.log(`Erreur de chargement d'image pour ${item.Nom}:`, e.nativeEvent.error)}
          />
          <Text style={styles.categoryName}>{item.Nom}</Text>
          <Text style={styles.categoryDescription}>Recettes disponibles: {item.recipe_count || 0}</Text>
        </View>
      </TouchableHighlight>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id_categories.toString()}
          contentContainerStyle={styles.listContainer}
        />
      )}
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
