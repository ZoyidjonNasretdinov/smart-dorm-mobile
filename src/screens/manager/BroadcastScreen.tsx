import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Radio, Send, ArrowLeft } from "lucide-react-native";
import { COLORS, SIZES, SHADOWS } from "../../theme/theme";
import { useAuth } from "../../context/AuthContext";
import { io } from "socket.io-client";
import * as SecureStore from "expo-secure-store";

const API_BASE = "http://192.168.68.105:3000";

export default function BroadcastScreen({ route, navigation }: any) {
  const { dormId } = route.params || {};
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const handleBroadcast = async () => {
    const content = text.trim();
    if (!content) return;
    if (!user) return;

    setSending(true);
    try {
      const token = await SecureStore.getItemAsync("token");
      const socket = io(API_BASE, {
        transports: ["websocket"],
        auth: { token },
      });

      await new Promise<void>((resolve, reject) => {
        socket.on("connect", () => {
          socket.emit(
            "sendGroupMessage",
            { senderId: user.id, dormId, content },
            () => {
              socket.disconnect();
              resolve();
            },
          );
          // fallback timeout
          setTimeout(() => {
            socket.disconnect();
            resolve();
          }, 2000);
        });
        socket.on("connect_error", reject);
      });

      setText("");
      Alert.alert("✅ Yuborildi", "Xabar barcha talabalar kanaliga yuborildi.");
    } catch (e) {
      Alert.alert("Xato", "Xabar yuborishda xatolik yuz berdi");
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft color="white" size={22} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Guruhga xabar</Text>
          <Text style={styles.headerSub}>Barcha talabalar oladi</Text>
        </View>
      </View>

      <View style={styles.body}>
        {/* Info card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Radio color="#10B981" size={28} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Broadcast xabar</Text>
            <Text style={styles.infoDesc}>
              Yozgan xabaringiz dormitoriyadagi barcha talabalar guruh kanaliga
              yuboriladi.
            </Text>
          </View>
        </View>

        {/* Message input */}
        <Text style={styles.fieldLabel}>Xabar matni</Text>
        <TextInput
          style={styles.textArea}
          value={text}
          onChangeText={setText}
          placeholder="Barcha talabalar uchun xabar yozing..."
          placeholderTextColor={COLORS.gray[400]}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          maxLength={500}
        />
        <Text style={styles.charCount}>{text.length}/500</Text>

        {/* Send Button */}
        <TouchableOpacity
          style={[
            styles.sendBtn,
            (!text.trim() || sending) && { opacity: 0.5 },
          ]}
          onPress={handleBroadcast}
          disabled={!text.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Send color="white" size={20} />
              <Text style={styles.sendBtnText}>Guruhga yuborish</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    backgroundColor: "#10B981",
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
  headerTitle: { fontSize: 17, fontWeight: "700", color: "white" },
  headerSub: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 },

  body: { flex: 1, padding: SIZES.padding },

  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1FAE5",
    borderRadius: 16,
    padding: 16,
    gap: 14,
    marginBottom: 24,
  },
  infoIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.soft,
  },
  infoTitle: { fontSize: 15, fontWeight: "700", color: "#065F46" },
  infoDesc: { fontSize: 13, color: "#047857", marginTop: 4, lineHeight: 18 },

  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.gray[600],
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1.5,
    borderColor: COLORS.gray[200],
    borderRadius: 16,
    padding: 14,
    fontSize: 15,
    color: COLORS.gray[900],
    backgroundColor: COLORS.white,
    minHeight: 140,
    ...SHADOWS.soft,
  },
  charCount: {
    textAlign: "right",
    fontSize: 12,
    color: COLORS.gray[400],
    marginTop: 6,
    marginBottom: 24,
  },

  sendBtn: {
    backgroundColor: "#10B981",
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    ...SHADOWS.medium,
  },
  sendBtnText: { color: "white", fontSize: 16, fontWeight: "700" },
});
