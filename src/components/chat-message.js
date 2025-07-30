import React from "react";
import { View, Text, StyleSheet } from "react-native";
//jake's random comment for commit
//audrey was here

export default function ChatMessageItem({ message, isOwnMessage, showHeader }) {
  const containerStyle = [
    styles.container,
    isOwnMessage ? styles.alignRight : styles.alignLeft,
  ];

  const contentWrapperStyle = [
    styles.contentWrapper,
    isOwnMessage && styles.alignItemsEnd,
  ];

  const headerStyle = [styles.header, isOwnMessage && styles.headerReverse];

  const messageBubbleStyle = [
    styles.messageBubble,
    isOwnMessage ? styles.ownMessage : styles.otherMessage,
  ];

  return (
    <View style={containerStyle}>
      <View style={contentWrapperStyle}>
        {showHeader && (
          <View style={headerStyle}>
            <Text style={styles.username}>{message.user.name}</Text>
            <Text style={styles.timestamp}>
              {new Date(message.createdAt).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </Text>
          </View>
        )}
        <View style={messageBubbleStyle}>
          <Text style={styles.messageText}>{message.content}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginTop: 8,
  },
  alignRight: {
    justifyContent: "flex-end",
  },
  alignLeft: {
    justifyContent: "flex-start",
  },
  contentWrapper: {
    maxWidth: "75%",
    alignSelf: "flex-start",
    flexDirection: "column",
    gap: 4, // Note: `gap` works in some React Native versions, or use marginBottom instead
  },
  alignItemsEnd: {
    alignItems: "flex-end",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
  },
  headerReverse: {
    justifyContent: "flex-end",
    flexDirection: "row-reverse",
  },
  username: {
    fontWeight: "500",
    fontSize: 12,
  },
  timestamp: {
    fontSize: 12,
    color: "gray",
  },
  messageBubble: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  ownMessage: {
    backgroundColor: "#007aff", // Customize this (e.g. your "primary" color)
  },
  otherMessage: {
    backgroundColor: "#e5e5ea", // Muted gray for other users
  },
  messageText: {
    color: "white",
    fontSize: 14,
  },
});
