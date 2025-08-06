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
    // await supabase.from("timer_sessions").insert({
    const { error: insertError } = await supabase
      .from("timer_sessions")
      .insert({
        room_id: roomId,
        user_email: userEmail,
        start_time: new Date().toISOString(),
        streak_cycle_timestamp: cycle.toISOString(),
      });

    if (insertError) {
      console.error("Error inserting into timer_sessions:", insertError);
    } else {
      console.log("Inserted into timer_sessions");
    }

    streakCycleRef.current = cycle;
  };

  const handleComplete = async () => {
    // console.log("HANDLE COMPLETE HIT 1");
    setShowModal(true);

    // get room_id and save to roomId
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

    // fetch current streak data, it comes as a map
    const { data: currentStreakData, error: streakError } = await supabase
      .from("room_streaks")
      .select("*")
      .eq("room_id", roomId)
      .single();

    // console.log("HANDLE COMPLETE HIT 2");

    if (!currentStreakData) {
      console.log("No current streak found for room, initializing at 0");
      return { shouldRepeat: false };
    }

    //get info on when cycles were compeleted and incremented
    const lastCompletedCycle = new Date(currentStreakData.last_completed_cycle);
    const lastIncrementedCycle = currentStreakData.last_incremented_cycle
      ? new Date(currentStreakData.last_incremented_cycle)
      : new Date(0);
    const thisCycle = new Date(streakCycleRef.current);
    thisCycle.setSeconds(0);
    thisCycle.setMilliseconds(0);

    if (!thisCycle) {
      console.error("No streakCycle found");
      return { shouldRepeat: false };
    }

    const diffInMs = thisCycle.getTime() - lastCompletedCycle.getTime();
    const diffInMinutes = diffInMs / 60000;

    // console.log("diffInMinutes:", diffInMinutes);
    // console.log("previous streak:", currentStreakData.current_streak);
    // console.log("lastIncrementedCycle:", lastIncrementedCycle.toISOString());
    // console.log("thisCycle:", thisCycle.toISOString());

    let shouldIncrementStreak = false;

    //if the difference from the last completed timer has been less than a minute AND the streak has not incremented this minute, we have the possibility to increment it. Inside we will check if all the participants have done so
    if (
      diffInMinutes >= 0 &&
      diffInMinutes < 1 &&
      lastIncrementedCycle.toISOString() !== thisCycle.toISOString()
    ) {
      // console.log("IF STATEMENT TO INCREMENT HIT");

      //now we get everybody in the group
      const { data: participantData, error: participantError } = await supabase
        .from("room_participants")
        .select("user_email")
        .eq("room_id", roomId);

      if (participantError || !participantData) {
        console.error("Could not fetch participants:", participantError);
        return { shouldRepeat: false };
      }

      //we map to haave just their emails (this could be made better parsing it but... another time)
      const totalParticipants = participantData.map((p) => p.user_email);

      //  Get users who finished the current cycle by checking the time stamps
      const { data: sessionData, error: sessionError } = await supabase
        .from("timer_sessions")
        .select("user_email")
        .eq("room_id", roomId)
        .eq("streak_cycle_timestamp", thisCycle.toISOString());

      if (sessionError) {
        console.error("Could not fetch timer_sessions:", sessionError);
        return { shouldRepeat: false };
      }

      //we turn those that finished into a set because we do not care about duplicates
      const uniqueFinishers = [
        ...new Set(sessionData.map((s) => s.user_email)),
      ];

      // defining a boolean if every body has at this point completed a timer in the past minute
      const allFinished = totalParticipants.every((email) =>
        uniqueFinishers.includes(email)
      );

      // console.log("Participants:", totalParticipants);
      // console.log("Finishers:", uniqueFinishers);

      //at this point if everybody has done their timer in the last minute we are good to increment
      if (allFinished) {
        shouldIncrementStreak = true;
        console.log("All users finished. Will increment streak.");
      } else {
        console.log(
          `Not all users finished. Required: ${totalParticipants.length}, Got: ${uniqueFinishers.length}`
        );
      }
    }

    //incrementing locally
    const newStreak = shouldIncrementStreak
      ? currentStreakData.current_streak + 1
      : currentStreakData.current_streak;

    // uploading the streak
    const { error: upsertError } = await supabase.from("room_streaks").upsert(
      {
        room_id: roomId,
        current_streak: newStreak,
        last_completed_cycle: thisCycle.toISOString(),
        last_incremented_cycle: shouldIncrementStreak
          ? thisCycle.toISOString()
          : currentStreakData.last_incremented_cycle,
      },
      { onConflict: ["room_id"] }
    );

    if (upsertError) {
      console.error("Error during upsert:", upsertError);
    } else {
      console.log(
        shouldIncrementStreak
          ? `Streak incremented to ${newStreak}`
          : `Streak not incremented. Still at ${newStreak}`
      );
    }

    return { shouldRepeat: false };
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
