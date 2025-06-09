import React from "react";
import { View } from "react-native";
import PropTypes from "prop-types";
import styles from "./styles";
import MenuButton from "../../components/MenuButton/MenuButton";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DrawerContainer({ navigation, isLoggedIn, setIsLoggedIn }) {
  return (
    <View style={styles.content}>
      <View style={styles.container}>
        <MenuButton
          title="HOME"
          source={require("../../../assets/icons/home.png")}
          onPress={() => {
            navigation.navigate("Main", { screen: "Home" });
            navigation.closeDrawer();
          }}
        />
        <MenuButton
          title="CATEGORIES"
          source={require("../../../assets/icons/category.png")}
          onPress={() => {
            navigation.navigate("Main", { screen: "Categories" });
            navigation.closeDrawer();
          }}
        />
        <MenuButton
          title="SEARCH"
          source={require("../../../assets/icons/search.png")}
          onPress={() => {
            navigation.navigate("Main", { screen: "Search" });
            navigation.closeDrawer();
          }}
        />

        {!isLoggedIn ? (
          <MenuButton
            title="CONNEXION"
            source={require("../../../assets/icons/login.png")}
            onPress={() => {
              navigation.navigate("Main", { screen: "Login" }); // 👈 important
              navigation.closeDrawer();
            }}
          />
        ) : (
          <>
            <MenuButton
              title="GÉRER LES RECETTES"
              source={require("../../../assets/icons/edit.png")}
              onPress={() => {
                navigation.navigate("Main", { screen: "Gérer les Recettes" });
                navigation.closeDrawer();
              }}
            />
            <MenuButton
              title="DÉCONNEXION"
              source={require("../../../assets/icons/logout.png")}
              onPress={async () => {
                await AsyncStorage.removeItem("token");
                setIsLoggedIn(false);
                navigation.navigate("Main", { screen: "Home" });
                navigation.closeDrawer();
              }}
            />
          </>
        )}
      </View>
    </View>
  );
}

DrawerContainer.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    closeDrawer: PropTypes.func.isRequired,
  }),
  isLoggedIn: PropTypes.bool.isRequired,
  setIsLoggedIn: PropTypes.func.isRequired,
};