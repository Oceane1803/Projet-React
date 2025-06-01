import React, { useLayoutEffect, useState, useEffect } from "react";
import { FlatList, Text, View, Image, TouchableHighlight, ActivityIndicator, Alert } from "react-native";
import styles from "./styles";

export default function IngredientsDetailsScreen(props) {
  const { navigation, route } = props;
  
  // État pour stocker les ingrédients
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ID de la recette passé en paramètre
  const recipeId = route.params?.recipeId;
  const recipeTitle = route.params?.title;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: recipeTitle || "Ingrédients",
      headerTitleStyle: {
        fontSize: 16,
      },
    });
  }, [recipeTitle]);

  console.log('URL finale utilisée :', `http://192.168.43.78:3000/recettes/${recipeId}/ingredients`);
  console.log('Type de recipeId:', typeof recipeId, 'Valeur:', recipeId);


  // Fonction pour récupérer les ingrédients depuis l'API
  const fetchIngredients = async () => {
    try {
      console.log('Début de la récupération des ingrédients pour recipeId:', recipeId);
      setLoading(true);
      setError(null);
      
      // Timeout pour éviter les requêtes infinies
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes
      
      const response = await fetch(
        `http://192.168.43.78:3000/recettes/${recipeId}/ingredients`,
        {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );
      
      clearTimeout(timeoutId);
      
      console.log('Statut de la réponse:', response.status);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Données reçues:', data);
      
      // Vérifier que data est un tableau
      if (Array.isArray(data)) {
        setIngredients(data);
      } else {
        console.warn('Les données reçues ne sont pas un tableau:', data);
        setIngredients([]);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des ingrédients:', err);
      setError(err.message);
      
      // Ne pas afficher l'alerte si l'erreur est due à un abort (timeout)
      if (err.name !== 'AbortError') {
        Alert.alert(
          "Erreur",
          "Impossible de charger les ingrédients. Vérifiez votre connexion.",
          [{ text: "OK" }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Charger les ingrédients au montage du composant
  useEffect(() => {
    console.log('useEffect appelé avec recipeId:', recipeId);
    if (recipeId) {
      fetchIngredients();
    } else {
      console.warn('Aucun recipeId fourni');
      setLoading(false);
      setError('ID de recette manquant');
    }
  }, [recipeId]);

  const onPressIngredient = (ingredient) => {
    navigation.navigate("Ingredient", { 
      ingredient: ingredient.id_ingredients, 
      name: ingredient.nom 
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
          source={{ uri: item.image_url || 'https://via.placeholder.com/150' }}
          defaultSource={{ uri: 'https://via.placeholder.com/150' }}
          onError={(error) => console.log('Erreur de chargement d\'image:', error)}
        />
        <Text style={styles.title}>{item.nom}</Text>
        <Text style={{ color: "grey" }}>{item.quantite || 'Quantité non spécifiée'}</Text>
      </View>
    </TouchableHighlight>
  );

  // Affichage du loader
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 10 }}>Chargement des ingrédients...</Text>
      </View>
    );
  }

  // Affichage en cas d'erreur
  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
        <Text style={{ color: 'red', textAlign: 'center', margin: 20 }}>
          Erreur: {error}
        </Text>
        <TouchableHighlight
          style={{ backgroundColor: '#007AFF', padding: 10, borderRadius: 5 }}
          onPress={fetchIngredients}
        >
          <Text style={{ color: 'white' }}>Réessayer</Text>
        </TouchableHighlight>
      </View>
    );
  }

  // Affichage principal
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        vertical
        showsVerticalScrollIndicator={false}
        numColumns={3}
        data={ingredients}
        renderItem={renderIngredient}
        keyExtractor={(item) => `ingredient_${item.id_ingredients}`}
        contentContainerStyle={{ padding: 10 }}
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
            <Text>Aucun ingrédient trouvé pour cette recette.</Text>
          </View>
        }
      />
    </View>
  );
}