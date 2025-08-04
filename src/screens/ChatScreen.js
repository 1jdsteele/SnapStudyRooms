import React, { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
// import Ionicons from "react-native-vector-icons/Ionicons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { supabase } from "../utils/hooks/supabase"; // Import Supabase client
import Header from "../components/Header";
// import { CHATBOTS } from "./ConversationScreen";
//

import { useAuthentication } from "../utils/hooks/useAuthentication";

import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
//

export default function ChatScreen({ navigation }) {
  const [chats, setChats] = useState([]);
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const { user } = useAuthentication();

  async function getUserGroupChats() {
    if (!user?.email) return;

    const { data, error } = await supabase
      .from("room_participants")
      // .select("chat_rooms(name)")
      .select("room_id, chat_rooms(name)")
      .eq("user_email", user.email);

    if (error) {
      console.error("Error fetching group chats:", error);
      return;
    }

    // Extract room names
    // const groupChats = data.map((entry) => ({
    //   isChatbot: false,
    //   chatId: entry.chat_rooms.name, // Use name as ID
    // }));

    console.log("FETCHED GROUP CHATS:", data);

    const groupChats = data
      .filter((entry) => entry.chat_rooms !== null) // filter out any that failed to join
      .map((entry) => ({
        isChatbot: false,
        chatId: entry.chat_rooms.name,
      }));

    // setChats((otherChats) => [...otherChats, ...groupChats]);
    setChats(groupChats);
  }

  // useEffect(() => {
  //   // if (chats.length < 1) {
  //   // getChatbots();
  //   // getUserChats();
  //   getUserGroupChats();
  //   // }
  //   // }, [chats.length]); //MAYBE in the future I do something like this but only if realtime doesn't do it on supabase
  // }, []);

  useFocusEffect(
    useCallback(() => {
      getUserGroupChats();
    }, [user?.email]) // re-run if user.email changes
  );

  //this useEffect specifically to load newly created chats
  useEffect(() => {
    if (!user?.email) return;

    const channel = supabase
      .channel("room_participants_updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "room_participants",
          filter: `user_email=eq.${user.email}`, // Only updates relevant to this user
        },
        (payload) => {
          console.log("📡 Real-time update for new room:", payload);
          getUserGroupChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.email]);

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
          marginBottom: tabBarHeight,
        },
      ]}
    >
      <Header title="Chats" />
      <View>
        {chats?.map((chat) => {
          return (
            <TouchableOpacity
              style={styles.userButton}
              // onPress={() => {
              //   navigation.navigate("Conversation", {
              //     isChatbot: chat.isChatbot,
              //     chatId: chat.chatId,
              //   });
              // }}
              onPress={() => {
                if (chat.isChatbot) {
                  navigation.navigate("Conversation", {
                    isChatbot: true,
                    chatId: chat.chatId,
                  });
                } else {
                  navigation.navigate("GroupChat", {
                    roomName: chat.chatId,
                  });
                }
              }}
              key={chat.chatId}
            >
              <Ionicons
                style={styles.userIcon}
                name="person-outline"
                size={36}
                color="lightgrey"
              />
              <Text style={styles.userName}> {chat.chatId} </Text>
              <Ionicons
                style={styles.userCamera}
                name="camera-outline"
                size={24}
                color="lightgrey"
              />
            </TouchableOpacity>
          );
        })}
        {/* <TouchableOpacity
          style={[styles.userButton, {}]}
          onPress={() =>
            navigation.navigate("GroupChat", { roomName: "global_room" })
          }
          key="global-chat"
        >
          <Ionicons
            style={styles.userIcon}
            name="people-outline"
            size={36}
            color="lightgrey"
          />
          <Text style={[styles.userName, { color: "black" }]}>
            Global Group Chat
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.userButton, {}]}
          onPress={() =>
            navigation.navigate("GroupChat", { roomName: "CS Study Group" })
          }
          key="cs-chat"
        >
          <Ionicons
            style={styles.userIcon}
            name="people-outline"
            size={36}
            color="lightgrey"
          />
          <Text style={[styles.userName, { color: "black" }]}>
            CS Study Group
          </Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  userButton: {
    padding: 25,
    display: "flex",
    borderBottomColor: "lightgrey",
    borderBottomWidth: 1,
  },
  userIcon: {
    position: "absolute",
    left: 5,
    top: 5,
  },
  userName: {
    position: "absolute",
    left: 50,
    top: 14,
    fontSize: 18,
  },
  userCamera: {
    position: "absolute",
    right: 15,
    top: 10,
  },
});
