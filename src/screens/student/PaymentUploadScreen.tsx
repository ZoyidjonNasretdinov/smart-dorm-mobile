import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Upload,
  ChevronDown,
  CheckCircle2,
  DollarSign,
  Calendar,
} from "lucide-react-native";
import { COLORS, SIZES, SHADOWS } from "../../theme/theme";
import GradientHeader from "../../components/GradientHeader";
import DashboardCard from "../../components/DashboardCard";
import { useNavigation } from "@react-navigation/native";

const PaymentUploadScreen: React.FC = () => {
  const navigation = useNavigation();
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState("Mart 2026");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleUpload = () => {
    // Mock upload logic
    setIsSuccess(true);
    setTimeout(() => {
      navigation.goBack();
    }, 2000);
  };

  if (isSuccess) {
    return (
      <View style={styles.successContainer}>
        <CheckCircle2 color="#10B981" size={80} />
        <Text style={styles.successTitle}>Muvaffaqiyatli!</Text>
        <Text style={styles.successSubtitle}>
          To'lov cheki tekshirish uchun yuborildi.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <GradientHeader
        title="To'lov yuklash"
        subtitle="Chekni tasdiqlash"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionTitle}>To'lov ma'lumotlari</Text>

        <DashboardCard>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>To'lov miqdori (so'm)</Text>
            <View style={styles.inputWrapper}>
              <DollarSign color={COLORS.gray[400]} size={18} />
              <TextInput
                style={styles.input}
                placeholder="Masalan: 500,000"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Qaysi oy uchun</Text>
            <TouchableOpacity style={styles.selector}>
              <Calendar color={COLORS.gray[400]} size={18} />
              <Text style={styles.selectorText}>{month}</Text>
              <ChevronDown color={COLORS.gray[400]} size={18} />
            </TouchableOpacity>
          </View>
        </DashboardCard>

        <Text style={styles.sectionTitle}>Chek nusxasi</Text>

        <TouchableOpacity style={styles.uploadArea}>
          <View style={styles.uploadBox}>
            <Upload color={COLORS.primary} size={32} />
            <Text style={styles.uploadAreaTitle}>Rasm yuklash</Text>
            <Text style={styles.uploadAreaSub}>
              JPEG, PNG formatlari (Maks. 5MB)
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, !amount && styles.disabledButton]}
          onPress={handleUpload}
          disabled={!amount}
        >
          <Text style={styles.submitButtonText}>Tasdiqlashga yuborish</Text>
        </TouchableOpacity>

        <View style={styles.noteContainer}>
          <Text style={styles.noteText}>
            * To'lovingiz 24 soat ichida menejer tomonidan ko'rib chiqiladi va
            tasdiqlanadi.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
    marginTop: -30,
  },
  scrollContent: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.gray[900],
    marginBottom: 16,
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: COLORS.gray[600],
    marginBottom: 8,
    fontWeight: "500",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    backgroundColor: "#F8FAFC",
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: COLORS.gray[900],
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    backgroundColor: "#F8FAFC",
  },
  selectorText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: COLORS.gray[900],
  },
  uploadArea: {
    marginBottom: 30,
  },
  uploadBox: {
    height: 180,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    borderRadius: 16,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadAreaTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
    marginTop: 12,
  },
  uploadAreaSub: {
    fontSize: 12,
    color: COLORS.gray[400],
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.medium,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  noteContainer: {
    marginTop: 20,
  },
  noteText: {
    fontSize: 12,
    color: COLORS.gray[400],
    textAlign: "center",
    lineHeight: 18,
  },
  successContainer: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.gray[900],
    marginTop: 20,
  },
  successSubtitle: {
    fontSize: 16,
    color: COLORS.gray[500],
    textAlign: "center",
    marginTop: 10,
  },
});

export default PaymentUploadScreen;
