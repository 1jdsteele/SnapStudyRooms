import * as React from "react";
import { Text, View, StyleSheet, Button, Modal } from "react-native";
import Constants from "expo-constants";
import { CountdownCircleTimer } from "react-native-countdown-circle-timer";

export function Timer() {
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [start, setStart] = React.useState(true);
  const [resume, setResume] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);

  const handleComplete = () => {
    setShowModal(true);
    return { shouldRepeat: false };
  };

  return (
    <View style={styles.container}>
      <CountdownCircleTimer
        isPlaying={isPlaying}
        duration={10}
        colors={["#004777", "#F7B801", "#A30000", "#A30000"]}
        colorsTime={[10, 6, 3, 0]}
        onComplete={handleComplete}
        updateInterval={1}
      >
        {({ remainingTime, color }) => (
          <Text style={{ color, fontSize: 40 }}>{remainingTime}</Text>
        )}
      </CountdownCircleTimer>

      {start && (
        <Button
          title="Start Session"
          onPress={() => {
            setIsPlaying((prev) => !prev);
            setStart(false);
            setResume(true);
          }}
        />
      )}

      {resume && (
        <Button
          title="Pause"
          onPress={() => {
            setIsPlaying((prev) => !prev);
            setResume(false);
          }}
        />
      )}

      {!resume && !start && (
        <Button
          title="Resume"
          onPress={() => {
            setIsPlaying((prev) => !prev);
            setResume(true);
          }}
        />
      )}

      {/* MODAL POP-UP */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              You finished your study session!{"\n"}
              To complete your streak for the day, choose one of the options
              below:
            </Text>
            <Button
              title="Watch a video!"
              onPress={() => setShowModal(false)}
            />
            <Button title="Try a lens!" onPress={() => setShowModal(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: Constants.statusBarHeight,
    backgroundColor: "#ecf0f1",
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
});
