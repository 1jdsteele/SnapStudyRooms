import * as React from "react";
import { Text, View, StyleSheet, Button, Modal } from "react-native";
import Constants from "expo-constants";
import { CountdownCircleTimer } from "react-native-countdown-circle-timer";
import { supabase } from "../utils/hooks/supabase";

export function Timer({ duration, navigation, roomName, userEmail }) {
  console.log("roomName:", roomName);
  console.log("userEmail:", userEmail);

  const [isPlaying, setIsPlaying] = React.useState(false);
  const [start, setStart] = React.useState(true);
  const [resume, setResume] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const streakCycleRef = React.useRef(null);

  // const handleComplete = async () => {
  //   console.log("HANDLE COMPLETE HIT 1");
  //   setShowModal(true);
  //   // First: fetch the current streak data
  //   const { data: currentStreakData, error } = await supabase
  //     .from("room_streaks")
  //     .select("*")
  //     .eq("room_id", roomName)
  //     .single();

  //   let newStreak = 1;
  //   console.log("HANDLE COMPLETE HIT 2");

  //   if (currentStreakData) {
  //     const lastCycle = new Date(currentStreakData.last_completed_cycle);
  //     const thisCycle = streakCycleRef.current;
  //     if (!thisCycle) {
  //       console.error("No streakCycle found");
  //       return { shouldRepeat: false };
  //     }

  //     const diffInMs = thisCycle.getTime() - lastCycle.getTime();
  //     const diffInMinutes = diffInMs / 60000;

  //     // If this cycle follows the last cycle directly, increment
  //     if (diffInMinutes === 1) {
  //       newStreak = currentStreakData.current_streak + 1;
  //     }
  //   }

  //   // Then update the streak
  //   await supabase.from("room_streaks").upsert(
  //     {
  //       room_id: roomName,
  //       current_streak: newStreak,
  //       last_completed_cycle: streakCycleRef.current.toISOString(),
  //     },
  //     { onConflict: ["room_id"] }
  //   );

  //   return { shouldRepeat: false };
  // };
  const handleComplete = async () => {
    console.log("HANDLE COMPLETE HIT 1");
    setShowModal(true);

    // Get UUID room_id from chat_rooms
    const { data: roomData, error: roomError } = await supabase
      .from("chat_rooms")
      .select("id")
      .eq("name", roomName)
      .single();

    if (roomError || !roomData) {
      console.error("Could not find room ID from roomName:", roomError);
      return { shouldRepeat: false };
    }

    const roomId = roomData.id;

    // Fetch current streak data using UUID
    const { data: currentStreakData, error } = await supabase
      .from("room_streaks")
      .select("*")
      .eq("room_id", roomId)
      .single();

    let newStreak = 1;
    console.log("HANDLE COMPLETE HIT 2");

    if (currentStreakData) {
      const lastCycle = new Date(currentStreakData.last_completed_cycle);
      const thisCycle = streakCycleRef.current;
      if (!thisCycle) {
        console.error("No streakCycle found");
        return { shouldRepeat: false };
      }

      const diffInMs = thisCycle.getTime() - lastCycle.getTime();
      const diffInMinutes = diffInMs / 60000;

      if (diffInMinutes === 1) {
        newStreak = currentStreakData.current_streak + 1;
      }
    }

    // Upsert into room_streaks using UUID
    await supabase.from("room_streaks").upsert(
      {
        room_id: roomId,
        current_streak: newStreak,
        last_completed_cycle: streakCycleRef.current.toISOString(),
      },
      { onConflict: ["room_id"] }
    );

    return { shouldRepeat: false };
  };

  // const handleStartSession = async () => {
  //   setIsPlaying(true);
  //   setStart(false);
  //   setResume(true);

  //   const cycle = new Date();
  //   cycle.setSeconds(0);
  //   cycle.setMilliseconds(0);

  //   console.log("HANDLE START SESSION 1");

  //   await supabase.from("timer_sessions").insert({
  //     room_id: roomName,
  //     user_email: userEmail,
  //     start_time: new Date().toISOString(),
  //     streak_cycle_timestamp: cycle.toISOString(),
  //   });

  //   console.log("HANDLE START SESSION 2");

  //   streakCycleRef.current = cycle;
  // };
  const handleStartSession = async () => {
    setIsPlaying(true);
    setStart(false);
    setResume(true);

    const cycle = new Date();
    cycle.setSeconds(0);
    cycle.setMilliseconds(0);

    // Get UUID room_id from chat_rooms
    const { data: roomData, error: roomError } = await supabase
      .from("chat_rooms")
      .select("id")
      .eq("name", roomName)
      .single();

    if (roomError || !roomData) {
      console.error("Could not find room ID from roomName:", roomError);
      return;
    }

    const roomId = roomData.id;

    // Insert into timer_sessions with UUID
    await supabase.from("timer_sessions").insert({
      room_id: roomId,
      user_email: userEmail,
      start_time: new Date().toISOString(),
      streak_cycle_timestamp: cycle.toISOString(),
    });

    streakCycleRef.current = cycle;
  };

  return (
    <View style={styles.container}>
      {/* Countdown Timer */}
      <CountdownCircleTimer
        isPlaying={isPlaying}
        // duration={duration * 60 || 0}
        duration={1}
        colors={["#004777", "#F7B801", "#A30000", "#A30000"]}
        colorsTime={[10, 6, 3, 0]}
        onComplete={handleComplete}
        updateInterval={1}
      >
        {({ remainingTime, color }) => {
          const minutes = Math.floor(remainingTime / 60);
          const seconds = remainingTime % 60;
          const newTime = `${minutes}:${seconds}`;

          return <Text style={{ color, fontSize: 40 }}>{newTime}</Text>;
        }}
      </CountdownCircleTimer>

      {start && <Button title="Start Session" onPress={handleStartSession} />}

      {resume && (
        <Button
          title="Pause"
          onPress={() => {
            setIsPlaying(false);
            setResume(false);
          }}
        />
      )}

      {!resume && !start && (
        <Button
          title="Resume"
          onPress={() => {
            setIsPlaying(true);
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
              onPress={() => {
                setShowModal(false);
                navigation.navigate("EducationalVideo");
              }}
            />

            <Button
              title="Play a game!"
              onPress={() => {
                setShowModal(false);
                navigation.navigate("EducationalGame");
              }}
            />

            <Button title="Go back" onPress={() => setShowModal(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 20,
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
