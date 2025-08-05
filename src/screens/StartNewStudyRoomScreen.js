import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../utils/hooks/supabase";
import { useAuthentication } from "../utils/hooks/useAuthentication";

export default function StartNewStudyRoomScreen({ navigation }) {
  const { user } = useAuthentication();
  const [name, setName] = useState("");
  const [inviteEmails, setInviteEmails] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    const roomName = name.trim();
    const inviter = user?.email ?? null;

    if (!roomName) {
      Alert.alert("Room name required", "Please enter a study room name.");
      return;
    }

    setLoading(true);
    try {
      // 1) Create the room
      const { data: room, error: roomErr } = await supabase
        .from("chat_rooms")
        .insert([{ name: roomName, created_by: inviter }])
        .select()
        .single();
      if (roomErr) throw roomErr;

      // 2) Add participants (current user + optional invite)
      const participants = [{ room_id: room.id, user_email: inviter }];
      //   const invited = inviteEmail.trim();
      //   if (invited) participants.push({ room_id: room.id, user_email: invited });
      const emailList = inviteEmails
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email.length > 0 && email !== inviter);

      emailList.forEach((email) => {
        participants.push({ room_id: room.id, user_email: email });
      });

      const { error: partErr } = await supabase
        .from("room_participants")
        .insert(participants);
      if (partErr) throw partErr;

      // 3) Go to the new room
      navigation.navigate("GroupChat", { roomName: room.name });
    } catch (e) {
      console.error(e);
      Alert.alert("Could not create room", e.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a Study Room</Text>

      <TextInput
        placeholder="Study Room Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <TextInput
        placeholder="Invite users (comma separated emails)"
        autoCapitalize="none"
        keyboardType="email-address"
        value={inviteEmails}
        onChangeText={setInviteEmails}
        style={styles.input}
      />

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button title="Create Room" onPress={handleCreate} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
});