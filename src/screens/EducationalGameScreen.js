import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

export default function EducationalGameScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>This is where you try on the lens</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 20,
    marginBottom: 20,
  },
});
