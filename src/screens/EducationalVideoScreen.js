import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

export default function EducationalVideoScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>This is the Educational Video Screen</Text>
      <Button
        title="Back to Chat"
        onPress={() => navigation.navigate("GroupChat")}
      />
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
