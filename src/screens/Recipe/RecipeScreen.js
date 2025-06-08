import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  View,
  Image,
  Dimensions,
  TouchableHighlight,
  ActivityIndicator,
} from "react-native";
import styles from "./styles";
import { useSharedValue } from "react-native-reanimated";
import Carousel, { Pagination } from "react-native-reanimated-carousel";
import axios from "axios";
import BackButton from "../../components/BackButton/BackButton";
import ViewIngredientsButton from "../../components/ViewIngredientsButton/ViewIngredientsButton";

const { width: viewportWidth } = Dimensions.get("window");

export default function RecipeScreen(props) {
  const { navigation, route } = props;
  const recipeId = route.params?.id;

  const [item, setItem] = useState(null);
  const progress = useSharedValue(0);
  const slider1Ref = useRef(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
      headerLeft: () => <BackButton onPress={() => navigation.goBack()} />,
      headerRight: () => <View />,
    });
  }, [navigation]);

  useEffect(() => {
    axios.get(`http://192.168.43.78:3000/recettes/${recipeId}`)
      .then((response) => {
        const data = response.data;
        
        console.log("Données reçues de l'API:", data);
        
        const recette = {
          id: data.id_recettes,
          title: data.Nom || "Titre non disponible",
          description: data.Description || "Description non disponible",
          instruction: data.Instruction || "Instructions non disponibles",
          time: data.temps_preparation && typeof data.temps_preparation === 'string' 
            ? parseInt(data.temps_preparation.split(":")[1]) 
            : 0,
          imageUrls: typeof data.image_url === 'string' 
            ? [data.image_url]
            : [],
          category: data.nom_categorie || "Non catégorisé",
          ingredients: data.ingredients || [],
        };

        console.log("Objet recette créé:", recette);
        setItem(recette);
      })
      .catch((error) => {
        console.error("Erreur API:", error);
        console.error("Détails de l'erreur:", error.response?.data);
        console.error("Status de l'erreur:", error.response?.status);
      });
  }, [recipeId]);

  if (!item) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  const renderImage = ({ item }) => (
    <TouchableHighlight>
      <View style={styles.imageContainer}>
        <Image style={styles.image} source={{ uri: item }} />
      </View>
    </TouchableHighlight>
  );

  const onPressPagination = (index) => {
    slider1Ref.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.carouselContainer}>
        <View style={styles.carousel}>
          <Carousel
            ref={(c) => (slider1Ref.current = c)}
            loop={false}
            width={viewportWidth}
            height={viewportWidth}
            autoPlay={false}
            data={item.imageUrls}
            scrollAnimationDuration={1000}
            renderItem={renderImage}
            onProgressChange={progress}
          />
          <Pagination.Basic
            renderItem={() => (
              <View
                style={{
                  backgroundColor: "rgba(255,255,255,1)",
                  flex: 1,
                }}
              />
            )}
            progress={progress}
            data={item.imageUrls}
            dotStyle={styles.paginationDot}
            containerStyle={styles.paginationContainer}
            onPress={onPressPagination}
          />
        </View>
      </View>

      <View style={styles.infoRecipeContainer}>
        <Text style={styles.infoRecipeName}>{item.title}</Text>
        {item.category && (
          <View style={styles.infoContainer}>
            <Text style={styles.category}>{item.category.toUpperCase()}</Text>
          </View>
        )}

        <View style={styles.infoContainer}>
          <Image
            style={styles.infoPhoto}
            source={require("../../../assets/icons/time.png")}
          />
          <Text style={styles.infoRecipe}>{item.time} minutes</Text>
        </View>

        <View style={styles.infoContainer}>
          <ViewIngredientsButton
            onPress={() =>
              navigation.navigate('IngredientsDetails', {
                recipeId: item.id,
                title: "Ingrédients pour " + item.title,
              })
            }
          />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoDescriptionRecipe}>{item.description}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoInstructionRecipe}>{item.instruction}</Text>
        </View>
      </View>
    </ScrollView>
  );
}
