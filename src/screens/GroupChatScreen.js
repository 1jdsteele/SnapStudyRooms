import { React, useState, useEffect, useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Button,
  StyleSheet,
  Platform,
  SafeAreaView,
} from "react-native";
import { supabase } from "../utils/hooks/supabase";
import { GiftedChat } from "react-native-gifted-chat";
import { useAuthentication } from "../utils/hooks/useAuthentication";
import { useRealtimeChat } from "../hooks/use-realtime-chat";
import { useChatScroll } from "../hooks/use-chat-scroll";
import { Timer } from "../components/Timer";

export default function GroupChatScreen({ route, navigation }) {
  const { user } = useAuthentication();
  const username = user?.email || "Guest";
  //const isSender = item.user_email === username;
  // const [test, setTest] = React.useState(false)

  const { messages, sendMessage, isConnected } = useRealtimeChat({
    roomName: "global_room",
    username,
  });

  const [input, setInput] = useState("");
  const { containerRef, scrollToBottom } = useChatScroll();

  const handleSend = () => {
    if (input.trim() !== "") {
      sendMessage(input.trim());
      setInput("");
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Group Chat</Text>

      <Timer navigation={navigation}> </Timer>

      <FlatList
        ref={containerRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const messageUser =
            item.user?.name.split("@")[0] ||
            item.user_email.split("@")[0] ||
            "Unknown";
          const isSender = messageUser === username.split("@")[0];

          return (
            <Text
              style={[
                styles.message,
                isSender ? styles.senderText : styles.otherText,
              ]}
            >
              <Text style={styles.username}>{messageUser} </Text>
              {"\n"}
              {/* { item.user?.name.split("@")[0] || item.user_email.split("@")[0] || 'Unknown'}:{" "}:  */}
              <Text style={styles.message}>{item.content}</Text>
            </Text>
          );
        }}
        onContentSizeChange={scrollToBottom}
      />

      <View style={styles.inputContainer}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          style={styles.input}
        />
        <Button title="Send" onPress={handleSend} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  message: { paddingVertical: 4, fontSize: 16 },
  username: { fontWeight: "bold" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
  },
  senderText: {
    color: "darkred",
  },
  otherText: {
    color: "black",
  },
});

//   useEffect(() => {
//     fetchConversations();
//     if (user !== null) {
//       setLoading(false);
//       // console.log("USER", user);
//     }
//   }, [user]);

//   async function fetchConversations() {
//     try {
//       const { data, error } = await supabase.from("conversations").select("*");
//       if (error) {
//         console.error("Error fetching conversations:", error.message);
//         return;
//       }
//       if (conversations) {
//         setConversations(data);
//         console.log("DATA", JSON.stringify(data, null, 4));
//         setMessages(data[0].messages);
//       }
//     } catch (error) {
//       console.error("Error fetching conversations:", error.message);
//     }
//   }
//   const handleInserts = (payload) => {
//     console.log("Change received!", JSON.stringify(payload, null, 4));
//     addNewMessage(payload.new.messages[0]);
//   };
//   // Listen to inserts
//   supabase
//     .channel("conversations")
//     .on(
//       "postgres_changes",
//       { event: "UPDATE", schema: "public", table: "conversations" },
//       handleInserts,
//     )
//     .subscribe();

//   const addNewMessage = (newMessages) => {
//     setMessages((previousMessages) => {
//       // console.log("PREVIOUS MESSAGES:", previousMessages);
//       // console.log("NEW MESSAGE:", newMessages);
//       return GiftedChat.append(previousMessages, newMessages);
//     });
//   };
//   const onSend = useCallback((messages = []) => {
//     addNewMessage(messages);
//   }, []);
//   async function postConversations(newMessages) {
//     const allMessages = [newMessages[0], ...messages];
//     const { data, error } = await supabase
//       .from("conversations")
//       .update({ messages: allMessages })
//       .eq("id", "areli_allison"); // id to access row of table in supabase, is changable
//     console.log("POST CONVERSATIONS ERROR: ", error);
//   }
//   // console.log("MESSAGES", JSON.stringify(messages, null, 4));
//   return (
//     <SafeAreaView style={styles.container}>
//       {messages && (
//         // <Text>{JSON.stringify(messages)}</Text>
//         <GiftedChat
//           messages={messages}
//           onSend={(newMessages) => {
//             onSend(newMessages);
//             postConversations(newMessages);
//           }}
//           user={{
//             // user that is doing the sending
//             _id: 2,
//             name: "Allison",
//           }}
//           renderUsernameOnMessage={true}
//         />
//       )}
//     </SafeAreaView>
//   );
// }
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#FFFFFF",
//     paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
//   },
// });
