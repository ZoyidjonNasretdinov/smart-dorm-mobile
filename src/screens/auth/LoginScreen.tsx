import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Mail, Lock, LogIn, AlertCircle, Moon } from "lucide-react-native";
import { useAuth, UserRole } from "../../context/AuthContext";
import { COLORS, SHADOWS } from "../../theme/theme";

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!identifier || !password) {
      setError("Iltimos, barcha maydonlarni to'ldiring");
      return;
    }

    setLoading(true);
    setError("");

    const result = await login(identifier, password);

    if (!result.success) {
      setError(result.message || "Xatolik yuz berdi");
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.themeToggle}>
            <Moon color={COLORS.gray[400]} size={24} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <LogIn color="white" size={32} />
            </View>
            <Text style={styles.title}>Xush kelibsiz</Text>
            <Text style={styles.subtitle}>Davom etish uchun kiring</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Telefon raqam</Text>
              <View style={styles.inputWrapper}>
                <Mail color={COLORS.gray[400]} size={20} />
                <TextInput
                  style={styles.input}
                  placeholder="+998901234567"
                  value={identifier}
                  onChangeText={setIdentifier}
                  autoCapitalize="none"
                  keyboardType="phone-pad"
                  placeholderTextColor={COLORS.gray[400]}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Parol</Text>
              <View style={styles.inputWrapper}>
                <Lock color={COLORS.gray[400]} size={20} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholderTextColor={COLORS.gray[400]}
                />
              </View>
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <AlertCircle color={COLORS.danger} size={18} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.loginButtonText}>Kirish</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Ro'yxatdan o'tish faqat admin/menejer tomonidan amalga oshiriladi
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  themeToggle: {
    alignSelf: "flex-end",
    marginTop: 10,
    padding: 8,
  },
  header: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  logoContainer: {
    width: 64,
    height: 64,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    ...SHADOWS.medium,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.gray[900],
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray[500],
    marginTop: 8,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.gray[900],
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 60,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.gray[900],
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    padding: 12,
    borderRadius: 12,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    height: 60,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    ...SHADOWS.medium,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    marginTop: 40,
    alignItems: "center",
  },
  footerText: {
    fontSize: 13,
    color: COLORS.gray[400],
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});
