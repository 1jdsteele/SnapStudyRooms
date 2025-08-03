import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

export default function StartNewStudyRoomScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        This is the new study room creation Screen
      </Text>
      {/* <Button
        title="Back to Chat"
        onPress={() => navigation.navigate("GroupChat")}
      /> */}
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
