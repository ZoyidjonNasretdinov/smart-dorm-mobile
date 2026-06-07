import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Send, ArrowLeft, Check, CheckCheck } from "lucide-react-native";
import { COLORS, SIZES, SHADOWS } from "../../theme/theme";
import apiClient, { BASE_URL } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { io, Socket } from "socket.io-client";
import * as SecureStore from "expo-secure-store";
import { ImageBackground } from "react-native";

// removed hardcoded IP

interface Message {
  _id: string;
  content: string;
  sender: { _id: string; name: string; role: string };
  createdAt: string;
  chatType: string;
  isRead?: boolean;
  replyTo?: { content: string; sender: { name: string } };
}

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
};

export default function ChatRoomScreen({ route, navigation }: any) {
  const { type, roomId, title, dormId } = route.params;
  const { user } = useAuth();
  const { theme, isDarkMode } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const typingTimeoutRef = useRef<any>(null);
  const socketRef = useRef<Socket | null>(null);
  const flatRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchHistory();
    connectSocket();
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await apiClient.get<Message[]>(
        `/chat/messages?room=${roomId}`,
      );
      setMessages(res.data);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const connectSocket = async () => {
    const token = await SecureStore.getItemAsync("token");
    const socket = io(BASE_URL, {
      transports: ["websocket"],
      auth: { token },
    });

    socket.on("connect", () => {
      console.log("[Chat] Socket connected:", socket.id);
      socket.emit("joinRoom", { room: roomId });
      if (type === "group") socket.emit("joinDormGroup", { dormId });
      if (type === "admin") socket.emit("joinAdminChat", { dormId });

      // Mark as read on connect
      socket.emit("markAsRead", { room: roomId, userId: user?.id });
    });

    socket.on("connect_error", (err) => {
      console.error("[Chat] Connection error:", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("[Chat] Socket disconnected:", reason);
    });

    socket.on("newMessage", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);

      // If we are looking at the chat, mark as read
      socket.emit("markAsRead", { room: roomId, userId: user?.id });
    });

    socket.on(
      "userTyping",
      (data: { senderName: string; isTyping: boolean }) => {
        if (data.isTyping) {
          setTypingUser(data.senderName);
        } else {
          setTypingUser(null);
        }
      },
    );

    socket.on("messagesRead", (data: { userId: string }) => {
      if (data.userId !== user?.id) {
        setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
      }
    });

    socketRef.current = socket;
  };

  const handleTextChange = (val: string) => {
    setText(val);

    if (socketRef.current) {
      socketRef.current.emit("typing", {
        room: roomId,
        senderName: user?.name,
        isTyping: true,
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit("typing", {
          room: roomId,
          senderName: user?.name,
          isTyping: false,
        });
      }, 2000);
    }
  };

  const sendMessage = () => {
    const content = text.trim();
    if (!content || !user) return;
    setText("");

    const socket = socketRef.current;
    if (!socket) return;

    if (type === "group") {
      socket.emit("sendGroupMessage", {
        senderId: user.id,
        dormId,
        content,
      });
    } else if (type === "admin") {
      socket.emit("sendAdminMessage", {
        senderId: user.id,
        dormId,
        content,
      });
    } else {
      // direct
      const recipientId = roomId
        .split("_")
        .find((id: string) => id !== user.id);
      socket.emit("sendMessage", {
        senderId: user.id,
        recipientId,
        content,
        room: roomId,
        chatType: "direct",
        dormId,
      });
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMe =
      item.sender?._id === user?.id || item.sender === (user?.id as any);

    const showDate =
      index === 0 ||
      new Date(messages[index - 1].createdAt).toDateString() !==
        new Date(item.createdAt).toDateString();

    return (
      <View>
        {showDate && (
          <View style={styles.dateDivider}>
            <View style={styles.datePill}>
              <Text style={styles.dateText}>
                {new Date(item.createdAt).toLocaleDateString("uz-UZ", {
                  day: "numeric",
                  month: "long",
                })}
              </Text>
            </View>
          </View>
        )}
        <View style={[styles.msgWrapper, isMe && styles.msgWrapperMe]}>
          {!isMe && type !== "direct" && (
            <View style={styles.msgAvatar}>
              <Text style={styles.msgAvatarText}>
                {(item.sender?.name || "?").charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View
            style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}
          >
            {!isMe && type !== "direct" && (
              <Text style={styles.senderName}>{item.sender?.name}</Text>
            )}
            <Text
              style={[styles.msgText, { color: isMe ? "white" : theme.text }]}
            >
              {item.content}
            </Text>
            <View style={styles.msgBottom}>
              <Text
                style={[
                  styles.msgTime,
                  {
                    color: isMe ? "rgba(255,255,255,0.7)" : theme.textSecondary,
                  },
                ]}
              >
                {formatTime(item.createdAt)}
              </Text>
              {isMe &&
                (item.isRead ? (
                  <CheckCheck
                    color="rgba(255,255,255,0.8)"
                    size={14}
                    style={{ marginLeft: 4 }}
                  />
                ) : (
                  <Check
                    color="rgba(255,255,255,0.8)"
                    size={14}
                    style={{ marginLeft: 4 }}
                  />
                ))}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: isDarkMode ? theme.card : COLORS.primary },
        ]}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft color="white" size={22} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={[styles.headerSub, { color: "rgba(255,255,255,0.8)" }]}>
            {typingUser
              ? `${typingUser} yozmoqda...`
              : type === "group"
                ? "Guruh kanali"
                : type === "admin"
                  ? "Admin Chat"
                  : "Bevosita"}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(m) => m._id}
          renderItem={renderMessage}
          contentContainerStyle={styles.msgList}
          onLayout={() => flatRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>
                Hali xabar yo'q. Birinchi xabar yuboring!
              </Text>
            </View>
          }
        />
      )}

      {/* Input */}
      <View
        style={[
          styles.inputRow,
          {
            backgroundColor: theme.card,
            borderTopColor: isDarkMode ? "#334155" : COLORS.gray[100],
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              color: theme.text,
              borderColor: isDarkMode ? "#334155" : COLORS.gray[200],
            },
          ]}
          value={text}
          onChangeText={handleTextChange}
          placeholder="Xabar yozing..."
          placeholderTextColor={
            isDarkMode ? COLORS.gray[500] : COLORS.gray[400]
          }
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !text.trim() && { opacity: 0.5 }]}
          onPress={sendMessage}
          disabled={!text.trim()}
        >
          <Send color="white" size={20} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyText: { fontSize: 14, color: COLORS.gray[400], textAlign: "center" },

  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: SIZES.padding,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  backBtn: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
  },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "white" },
  headerSub: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 },

  msgList: { padding: SIZES.padding, gap: 8, paddingBottom: 16 },
  msgWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 4,
  },
  msgWrapperMe: { flexDirection: "row-reverse" },
  msgAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  msgAvatarText: { color: "white", fontSize: 12, fontWeight: "700" },
  bubble: {
    maxWidth: "75%",
    borderRadius: 18,
    padding: 12,
    gap: 4,
  },
  bubbleMe: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
    ...SHADOWS.soft,
  },
  senderName: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 2,
  },
  msgText: { fontSize: 14, color: COLORS.gray[900], lineHeight: 20 },
  msgTime: { fontSize: 10, color: COLORS.gray[400], alignSelf: "flex-end" },

  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    paddingBottom: Platform.OS === "ios" ? 28 : 12,
    backgroundColor: COLORS.white,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.gray[200],
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.gray[900],
    maxHeight: 120,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.soft,
  },

  dateDivider: {
    alignItems: "center",
    marginVertical: 12,
  },
  datePill: {
    backgroundColor: "rgba(0,0,0,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.gray[600],
    fontWeight: "600",
  },
  msgBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 2,
  },
});
