import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "./styles";

export default function LoginScreen({ navigation, setIsLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onLogin = async () => {
    try {
      const response = await fetch("http://192.168.43.78:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const result = await response.json();
  
      if (response.ok && result.token) {
        // 🔐 Stocker le token
        await AsyncStorage.setItem("token", result.token);
  
        // ✅ Changer de page après succès
        setIsLoggedIn(true);
        navigation.navigate("Main", { screen: "Home" }); // ou "Recettes" selon ton nom d'écran
      } else {
        Alert.alert("Erreur", result.error || "Identifiants incorrects");
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de se connecter");
      console.error("Login error:", error);
    }
  };
  
  

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <Image
        source={require("../../../assets/icons/login.png")}
        style={styles.image}
      />
      <Text style={styles.title}>Connexion</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={setEmail}
        value={email}
      />

      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        placeholderTextColor="#888"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />

      <TouchableOpacity style={styles.button} onPress={onLogin}>
        <Text style={styles.buttonText}>Se connecter</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}