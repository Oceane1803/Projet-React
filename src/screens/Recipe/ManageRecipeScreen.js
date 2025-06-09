import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, FlatList, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ManageRecipeScreen() {
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [description, setDescription] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [ingredients, setIngredients] = useState([]); // Tous les ingrédients de la BDD
  const [selectedIngredients, setSelectedIngredients] = useState([]); // Ingrédients choisis
  const [newIngredientName, setNewIngredientName] = useState('');
  const [newIngredientQuantity, setNewIngredientQuantity] = useState('');
  const [newIngredientImage, setNewIngredientImage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      console.log('Chargement des ingrédients...');
      
      const res = await fetch('http://192.168.43.78:3000/ingredients', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Ingrédients chargés:', data);
      
      // Les données sont déjà formatées côté serveur
      setIngredients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erreur lors du chargement des ingrédients:', err);
      Alert.alert(
        'Erreur', 
        `Impossible de charger les ingrédients.\n\nDétails: ${err.message}\n\nVérifiez que votre serveur est démarré.`
      );
      setIngredients([]);
    } finally {
      setLoading(false);
    }
  };

  const selectExistingIngredient = (ingredient, quantity) => {
    if (!quantity.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir une quantité');
      return;
    }

    // Vérifier si l'ingrédient n'est pas déjà sélectionné
    const isAlreadySelected = selectedIngredients.some(
      selected => selected.id === ingredient.id || selected.name === ingredient.name
    );

    if (isAlreadySelected) {
      Alert.alert('Erreur', 'Cet ingrédient est déjà sélectionné');
      return;
    }

    setSelectedIngredients([...selectedIngredients, {
      id: ingredient.id,
      name: ingredient.name,
      quantity: quantity,
      isNew: false
    }]);
  };

  const addNewIngredient = () => {
    if (!newIngredientName.trim() || !newIngredientQuantity.trim()) {
      Alert.alert('Erreur', 'Nom et quantité requis');
      return;
    }

    // Vérifier si l'ingrédient n'existe pas déjà
    const existsInDb = ingredients.some(
      ing => ing.name.toLowerCase() === newIngredientName.trim().toLowerCase()
    );

    if (existsInDb) {
      Alert.alert('Erreur', 'Cet ingrédient existe déjà dans la base de données. Utilisez la liste des ingrédients existants.');
      return;
    }

    const isAlreadySelected = selectedIngredients.some(
      selected => selected.name.toLowerCase() === newIngredientName.trim().toLowerCase()
    );

    if (isAlreadySelected) {
      Alert.alert('Erreur', 'Cet ingrédient est déjà sélectionné');
      return;
    }

    setSelectedIngredients([...selectedIngredients, {
      name: newIngredientName.trim(),
      quantity: newIngredientQuantity.trim(),
      image_url: newIngredientImage.trim() || null,
      isNew: true
    }]);

    setNewIngredientName('');
    setNewIngredientQuantity('');
    setNewIngredientImage('');
  };

  const removeSelectedIngredient = (index) => {
    const updatedIngredients = selectedIngredients.filter((_, i) => i !== index);
    setSelectedIngredients(updatedIngredients);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !instructions.trim() || selectedIngredients.length === 0) {
      Alert.alert('Erreur', 'Veuillez remplir au minimum le titre, les instructions et ajouter au moins un ingrédient');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      
      const res = await fetch('http://192.168.43.78:3000/recipes/full', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          instructions: instructions.trim(),
          description: description.trim(),
          prepTime: prepTime.trim(),
          imageUrl: imageUrl.trim(),
          categoryId: categoryId ? parseInt(categoryId) : null,
          ingredients: selectedIngredients,
        }),
      });

      if (res.ok) {
        Alert.alert('Succès', 'Recette ajoutée avec succès');
        // Reset du formulaire
        setTitle('');
        setInstructions('');
        setDescription('');
        setPrepTime('');
        setImageUrl('');
        setCategoryId('');
        setSelectedIngredients([]);
      } else {
        const errorData = await res.json();
        Alert.alert('Erreur', errorData.message || 'Erreur lors de l\'ajout de la recette');
      }
    } catch (err) {
      console.error('Erreur réseau:', err);
      Alert.alert('Erreur', 'Erreur de connexion au serveur');
    }
  };

  const IngredientSelector = ({ ingredient }) => {
    const [quantity, setQuantity] = useState('');

    return (
      <View style={styles.ingredientSelector}>
        <Text style={styles.ingredientName}>{ingredient.name}</Text>
        <TextInput
          style={styles.quantityInput}
          placeholder="Quantité"
          value={quantity}
          onChangeText={setQuantity}
        />
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => {
            selectExistingIngredient(ingredient, quantity);
            setQuantity('');
          }}
        >
          <Text style={styles.selectButtonText}>Ajouter</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Ajouter une nouvelle recette</Text>

      <Text style={styles.label}>Titre *</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} />

      <Text style={styles.label}>Instructions *</Text>
      <TextInput 
        style={[styles.input, styles.multilineInput]} 
        value={instructions} 
        onChangeText={setInstructions} 
        multiline 
        numberOfLines={4}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput 
        style={[styles.input, styles.multilineInput]} 
        value={description} 
        onChangeText={setDescription} 
        multiline 
        numberOfLines={3}
      />

      <Text style={styles.label}>Temps de préparation (ex: 01:30:00)</Text>
      <TextInput style={styles.input} value={prepTime} onChangeText={setPrepTime} />

      <Text style={styles.label}>URL de l'image</Text>
      <TextInput style={styles.input} value={imageUrl} onChangeText={setImageUrl} />

      <Text style={styles.label}>ID Catégorie</Text>
      <TextInput style={styles.input} value={categoryId} onChangeText={setCategoryId} keyboardType="numeric" />

      {/* Section des ingrédients existants */}
      <Text style={styles.sectionTitle}>Ingrédients disponibles</Text>
      {loading ? (
        <Text>Chargement des ingrédients...</Text>
      ) : ingredients.length > 0 ? (
        <FlatList
          data={ingredients}
          keyExtractor={(item) => item.id?.toString() || item.name}
          renderItem={({ item }) => <IngredientSelector ingredient={item} />}
          scrollEnabled={false}
        />
      ) : (
        <Text style={styles.noIngredientsText}>Aucun ingrédient trouvé dans la base de données</Text>
      )}

      {/* Section pour ajouter un nouvel ingrédient */}
      <Text style={styles.sectionTitle}>Ajouter un nouvel ingrédient</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Nom du nouvel ingrédient" 
        value={newIngredientName} 
        onChangeText={setNewIngredientName} 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Quantité" 
        value={newIngredientQuantity} 
        onChangeText={setNewIngredientQuantity} 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Image" 
        value={newIngredientImage} 
        onChangeText={setNewIngredientImage} 
      />
      <Button title="Ajouter le nouvel ingrédient" onPress={addNewIngredient} />

      {/* Ingrédients sélectionnés */}
      <Text style={styles.sectionTitle}>Ingrédients sélectionnés ({selectedIngredients.length})</Text>
      {selectedIngredients.length > 0 ? (
        <FlatList
          data={selectedIngredients}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.selectedIngredient}>
              <Text style={styles.selectedIngredientText}>
                {item.name} ({item.quantity}) {item.isNew && '(nouveau)'}
              </Text>
              <TouchableOpacity onPress={() => removeSelectedIngredient(index)}>
                <Text style={styles.removeButton}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          )}
          scrollEnabled={false}
        />
      ) : (
        <Text style={styles.noSelectedText}>Aucun ingrédient sélectionné</Text>
      )}

      <View style={styles.submitContainer}>
        <Button title="Ajouter la recette" onPress={handleSubmit} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 25,
    marginBottom: 15,
    color: '#333'
  },
  label: { 
    fontWeight: 'bold', 
    marginTop: 15,
    marginBottom: 5,
    color: '#555'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top'
  },
  ingredientSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 10,
    marginBottom: 8,
    borderRadius: 8
  },
  ingredientName: {
    flex: 2,
    fontSize: 16,
    fontWeight: '500'
  },
  quantityInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    marginHorizontal: 10,
    fontSize: 14
  },
  selectButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6
  },
  selectButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12
  },
  selectedIngredient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8
  },
  selectedIngredientText: {
    fontSize: 16,
    flex: 1
  },
  removeButton: {
    color: '#ff4444',
    fontWeight: 'bold',
    fontSize: 14
  },
  noIngredientsText: {
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
    marginVertical: 15
  },
  noSelectedText: {
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
    marginVertical: 10
  },
  submitContainer: {
    marginTop: 30,
    marginBottom: 20
  }
});