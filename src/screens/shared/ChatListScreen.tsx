import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  MessageCircle,
  Shield,
  Radio,
  ChevronRight,
} from "lucide-react-native";
import { COLORS, SIZES, SHADOWS } from "../../theme/theme";
import { useTheme } from "../../context/ThemeContext";
import apiClient from "../../api/client";
import GradientHeader from "../../components/GradientHeader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../context/AuthContext";

interface Conversation {
  _id: string;
  lastMessage: string;
  lastTime: string;
  otherUser?: { name: string; role: string };
  chatType: "direct" | "group" | "admin";
}

const formatTime = (iso: string) => {
  const d = new Date(iso);
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
};

export default function ChatListScreen({ navigation }: any) {
  const { user } = useAuth();
  const { theme, isDarkMode } = useTheme();
  const [dormId, setDormId] = useState("");
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("selectedDormId").then((id) => {
      setDormId(id || "");
      fetchConversations(id || "");
    });
  }, []);

  const fetchConversations = async (dId: string) => {
    try {
      const res = await apiClient.get<Conversation[]>(
        `/chat/conversations?dormId=${dId}`,
      );
      setConvos(res.data);
    } catch {
      setConvos([
        {
          _id: "c1",
          lastMessage: "Salom, holat qalaydi?",
          lastTime: new Date().toISOString(),
          otherUser: { name: "Sardor Rahimov", role: "student" },
          chatType: "direct",
        },
        {
          _id: "c2",
          lastMessage: "Yangi e'lon: suvni tejang",
          lastTime: new Date().toISOString(),
          chatType: "group",
        },
        {
          _id: "c3",
          lastMessage: "Muammo bormi?",
          lastTime: new Date().toISOString(),
          chatType: "admin",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const directConvos = convos.filter((c) => c.chatType === "direct");
  const groupConvo = convos.find((c) => c.chatType === "group");
  const adminConvo = convos.find((c) => c.chatType === "admin");

  const openRoom = (type: string, roomId: string, title: string) => {
    navigation.navigate("ChatRoom", { type, roomId, title, dormId });
  };

  const renderDirect = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={[styles.convoCard, { backgroundColor: theme.card }]}
      onPress={() =>
        openRoom("direct", item._id, item.otherUser?.name || "Suhbat")
      }
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {(item.otherUser?.name || "?").charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.convoInfo}>
        <Text style={[styles.convoName, { color: theme.text }]}>
          {item.otherUser?.name || "Suhbat"}
        </Text>
        <Text
          style={[styles.convoLast, { color: theme.textSecondary }]}
          numberOfLines={1}
        >
          {item.lastMessage}
        </Text>
      </View>
      <View style={styles.convoMeta}>
        <Text style={[styles.convoTime, { color: theme.textSecondary }]}>
          {formatTime(item.lastTime)}
        </Text>
        <ChevronRight color={theme.textSecondary} size={16} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title="Chat" subtitle="Xabarlar" />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={[]}
          keyExtractor={() => ""}
          renderItem={() => null}
          ListHeaderComponent={
            <>
              {/* Admin Chat */}
              <SectionHeader
                icon={<Shield color={COLORS.primary} size={16} />}
                title="Admin Chat"
                textColor={theme.textSecondary}
              />
              <TouchableOpacity
                style={[styles.specialCard, { backgroundColor: theme.card }]}
                onPress={() =>
                  openRoom("admin", `admin_${dormId}`, "Admin Chat")
                }
              >
                <View
                  style={[
                    styles.specialIcon,
                    { backgroundColor: isDarkMode ? "#312e81" : "#EDE9FE" },
                  ]}
                >
                  <Shield
                    color={isDarkMode ? COLORS.secondary : COLORS.primary}
                    size={22}
                  />
                </View>
                <View style={styles.convoInfo}>
                  <Text style={[styles.convoName, { color: theme.text }]}>
                    Admin bilan muloqot
                  </Text>
                  <Text
                    style={[styles.convoLast, { color: theme.textSecondary }]}
                    numberOfLines={1}
                  >
                    {adminConvo?.lastMessage || "Hali xabar yo'q"}
                  </Text>
                </View>
                <ChevronRight color={theme.textSecondary} size={16} />
              </TouchableOpacity>

              {/* Guruh/Broadcast */}
              {(user?.role === "manager" || user?.role === "student") && (
                <>
                  <SectionHeader
                    icon={<Radio color="#10B981" size={16} />}
                    title="Guruh kanali"
                    textColor={theme.textSecondary}
                  />
                  <TouchableOpacity
                    style={[
                      styles.specialCard,
                      { backgroundColor: theme.card },
                    ]}
                    onPress={() =>
                      navigation.navigate(
                        user?.role === "manager" ? "Broadcast" : "ChatRoom",
                        user?.role === "manager"
                          ? { dormId }
                          : {
                              type: "group",
                              roomId: `group_${dormId}`,
                              title: "Guruh",
                              dormId,
                            },
                      )
                    }
                  >
                    <View
                      style={[
                        styles.specialIcon,
                        { backgroundColor: isDarkMode ? "#064e3b" : "#D1FAE5" },
                      ]}
                    >
                      <Radio color="#10B981" size={22} />
                    </View>
                    <View style={styles.convoInfo}>
                      <Text style={[styles.convoName, { color: theme.text }]}>
                        {user?.role === "manager"
                          ? "Guruhga xabar yuborish"
                          : "Dorm guruh kanali"}
                      </Text>
                      <Text
                        style={[
                          styles.convoLast,
                          { color: theme.textSecondary },
                        ]}
                        numberOfLines={1}
                      >
                        {groupConvo?.lastMessage || "Hali xabar yo'q"}
                      </Text>
                    </View>
                    <ChevronRight color={theme.textSecondary} size={16} />
                  </TouchableOpacity>
                </>
              )}

              {/* Direct Chats */}
              <SectionHeader
                icon={<MessageCircle color={COLORS.gray[600]} size={16} />}
                title="Bevosita suhbatlar"
                textColor={theme.textSecondary}
              />
              {directConvos.length === 0 && (
                <View style={styles.emptyBox}>
                  <MessageCircle color={theme.textSecondary} size={36} />
                  <Text
                    style={[styles.emptyText, { color: theme.textSecondary }]}
                  >
                    Hali suhbat yo'q
                  </Text>
                </View>
              )}
            </>
          }
          ListFooterComponent={
            <FlatList
              data={directConvos}
              keyExtractor={(i) => i._id}
              renderItem={renderDirect}
              scrollEnabled={false}
            />
          }
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
    </View>
  );
}

const SectionHeader = ({
  icon,
  title,
  textColor,
}: {
  icon: React.ReactNode;
  title: string;
  textColor?: string;
}) => (
  <View style={styles.sectionHeader}>
    {icon}
    <Text style={[styles.sectionTitle, textColor ? { color: textColor } : {}]}>
      {title}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: SIZES.padding,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.gray[500],
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  specialCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.padding,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    marginBottom: 4,
    ...SHADOWS.soft,
  },
  specialIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },

  convoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.padding,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    marginBottom: 6,
    ...SHADOWS.soft,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "white", fontSize: 16, fontWeight: "700" },
  convoInfo: { flex: 1 },
  convoName: { fontSize: 15, fontWeight: "700", color: COLORS.gray[900] },
  convoLast: { fontSize: 13, color: COLORS.gray[400], marginTop: 2 },
  convoMeta: { alignItems: "flex-end", gap: 4 },
  convoTime: { fontSize: 11, color: COLORS.gray[400] },

  emptyBox: {
    alignItems: "center",
    padding: 24,
    gap: 8,
  },
  emptyText: { fontSize: 14, color: COLORS.gray[400] },
});
