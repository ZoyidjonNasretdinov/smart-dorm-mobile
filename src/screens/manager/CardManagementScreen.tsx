import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { CreditCard, Calendar, Lock } from "lucide-react-native";
import { COLORS, SIZES, SHADOWS } from "../../theme/theme";
import { useTheme } from "../../context/ThemeContext";
import GradientHeader from "../../components/GradientHeader";
import apiClient from "../../api/client";
import { useNavigation } from "@react-navigation/native";

const CardManagementScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBindCard = async () => {
    if (cardNumber.length < 16) {
      Alert.alert("Xatolik", "Karta raqami noto'g'ri");
      return;
    }
    setLoading(true);
    try {
      await apiClient.post("/subscription/card", {
        last4: cardNumber.slice(-4),
        brand: cardNumber.startsWith("4") ? "Visa" : "MasterCard",
      });
      Alert.alert("Muvaffaqiyatli", "Karta muvaffaqiyatli bog'landi!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Xatolik", "Kartani bog'lashda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <GradientHeader title="Karta" subtitle="To'lov ma'lumotlari" />

      <View style={styles.content}>
        <View style={[styles.cardForm, { backgroundColor: theme.card }]}>
          <Text style={[styles.label, { color: theme.text }]}>
            Karta raqami
          </Text>
          <View style={styles.inputContainer}>
            <CreditCard color={COLORS.gray[400]} size={20} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="0000 0000 0000 0000"
              placeholderTextColor={COLORS.gray[400]}
              keyboardType="numeric"
              maxLength={16}
              value={cardNumber}
              onChangeText={setCardNumber}
            />
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.text }]}>Muddat</Text>
              <View style={styles.inputContainer}>
                <Calendar color={COLORS.gray[400]} size={20} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="MM/YY"
                  placeholderTextColor={COLORS.gray[400]}
                  keyboardType="numeric"
                  maxLength={5}
                  value={expiry}
                  onChangeText={setExpiry}
                />
              </View>
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={[styles.label, { color: theme.text }]}>CVV</Text>
              <View style={styles.inputContainer}>
                <Lock color={COLORS.gray[400]} size={20} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="123"
                  placeholderTextColor={COLORS.gray[400]}
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                  value={cvv}
                  onChangeText={setCvv}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleBindCard}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Bog'lanmoqda..." : "Kartani bog'lash"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.secureNote}>
          <Lock color={COLORS.gray[400]} size={14} />
          <Text style={styles.secureText}>
            Ma'lumotlaringiz xavfsiz saqlanadi
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SIZES.padding, marginTop: -30 },
  cardForm: { padding: 20, borderRadius: 15, ...SHADOWS.medium },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  input: { flex: 1, height: 50, marginLeft: 10, fontSize: 16 },
  row: { flexDirection: "row" },
  button: {
    backgroundColor: COLORS.primary,
    height: 55,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "white", fontSize: 18, fontWeight: "bold" },
  secureNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    gap: 5,
  },
  secureText: { fontSize: 12, color: COLORS.gray[400] },
});

export default CardManagementScreen;
