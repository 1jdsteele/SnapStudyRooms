import React, { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
// import Ionicons from "react-native-vector-icons/Ionicons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { supabase } from "../utils/hooks/supabase"; // Import Supabase client
import Header from "../components/Header";
import { useNavigation } from "@react-navigation/native";
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

    if (error) 
    {
      console.error("Error fetching group chats:", error);
      return;
    }

    // All of the rooms (identified by id number) that the user is part of
    const roomIds = data.map((entry) => entry.room_id);
    console.log("FETCHED Room Ids:", roomIds);

    // const {data: streak, error: streakError} = await supabase
    //   .from("room_streaks")
    //   .select("room_id", "current_streak")
    //   .in("room_id", roomIds);
    // if (streakError) 
    // {
    //   console.error("Error fetching streak info:", error);
    //   return;
    // }

    // const allStreaks = streak.map((entry) => entry.current_streak);
    // console.log("FETCHED Streaks:", allStreaks);

    const groupChats = data
      .filter((entry) => entry.chat_rooms !== null) // filter out any that failed to join
      .map((entry) => ({
        isChatbot: false,
        chatId: entry.chat_rooms.name,
        //streak: allStreaks.get(entry.room_id) ?? 0,
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
  {/* Since ChatScreen is in UserTab for navigation and we're trying to reach a new study room that lives in UserStack, calling getParent()
  will navigate to the parent stack screen. */}
        <TouchableOpacity style={styles.circleIcon}
          onPress={() => {
            const parentNavigation = navigation.getParent();
            parentNavigation.navigate("NewStudyRoom");
          }}
          activeOpacity={0.85}
        >
          <Ionicons name="chatbox-outline" size={30} color={"black"}/>
          
        </TouchableOpacity>
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
  circleIcon: {
    width: 60,
    height: 60,
    top: 375,
    left: 325,
    borderRadius: 50,
    backgroundColor: "yellow",
    alignItems: "center",     
    justifyContent: "center",
    shadowColor: "#000",     
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 8 },

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
