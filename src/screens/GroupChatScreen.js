import { React, useState, useEffect, useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import { View, Text, FlatList, TextInput, Button, StyleSheet, Platform, SafeAreaView } from "react-native";
import { supabase } from "../utils/hooks/supabase";
import { GiftedChat } from "react-native-gifted-chat";
import { useAuthentication } from "../utils/hooks/useAuthentication";
import { useRealtimeChat } from "../hooks/use-realtime-chat";
import { useChatScroll } from "../hooks/use-chat-scroll";
import { Timer } from "../components/Timer"; 
import Modal from 'react-native-modal';

export default function GroupChatScreen({ route, navigation }) {
    const { user } = useAuthentication();
    const username = user?.email || 'Guest';
    //const isSender = item.user_email === username;
    // const [test, setTest] = React.useState(false)
 
    const { messages, sendMessage, isConnected} = useRealtimeChat({
        roomName: 'global_room',
        username
         
    });

    const [input, setInput] = useState('');
    const { containerRef, scrollToBottom } = useChatScroll();

    const handleSend = () => {
    if (input.trim() !== '') {
      sendMessage(input.trim());
      setInput('');
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const [isModalVisible, setModalVisible] = useState(true);
  const [number, onChangeNumber] = useState(0);
  const [studyTime, setStudyTime] = useState(0);

  return (

    <View style={styles.container}>
      <Timer duration={studyTime}></Timer>
      <View style={{flex: 1}}>
        <Modal isVisible={isModalVisible}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>How much time do you want to study?</Text>
              <TextInput
                style={styles.timerInput}
                onChangeText={onChangeNumber}
                value={number}
                keyboardType="numeric"
              />
              <Button title="Let's do it" onPress={() => {
                setStudyTime(parseInt(number)); 
                setModalVisible(false);        
                console.log(`Starting timer for ${number} minutes`);
              }} />
            </View>
          </View>
        </Modal>

      </View>

      <Text style={styles.header}>Group Chat</Text>
      
      <FlatList
        ref = {containerRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          
          const messageUser = item.user?.name.split("@")[0] || item.user_email.split("@")[0]|| 'Unknown';
          const isSender = messageUser === username.split("@")[0];
          
          return(
          <Text style={[styles.message, isSender?styles.senderText : styles.otherText]}>
            <Text style={styles.username}>{messageUser} </Text>
             {'\n'}
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
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  message: { paddingVertical: 4, fontSize: 16},
  username: { fontWeight: 'bold' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
  },

  timerInput: {
    width: 100,         
    height: 40,         
    margin: 12,
    borderWidth: 1,
    padding: 10,
    color: "black",
    borderColor: "white", 
    backgroundColor: 'white', 
    fontSize: 18,      
    marginTop: -10,
  },
  senderText: {
    color: 'darkred'
  },
  otherText: {
    color: 'black'
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  modalText: {
    marginBottom: 30,
    textAlign: 'center',
    fontSize: 18,
    color: "white",
  },
});