import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import {
  User,
  Mail,
  Phone,
  Shield,
  LogOut,
  Settings,
  Bell,
  Moon,
  Sun,
  CreditCard,
  Crown,
  Edit2,
  Lock,
  CheckCircle,
  X,
  ChevronRight,
  Camera,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { COLORS, SIZES, SHADOWS } from "../../theme/theme";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import GradientHeader from "../../components/GradientHeader";
import apiClient, { BASE_URL } from "../../api/client";

const ProfileScreen: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const navigation = useNavigation<any>();

  const [uploading, setUploading] = useState(false);

  // Edit modal state
  const [editVisible, setEditVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    password: "",
    confirmPassword: "",
  });

  const openEdit = () => {
    setForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      password: "",
      confirmPassword: "",
    });
    setEditVisible(true);
  };

  const handleChooseAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Ruxsat kerak", "Rasm tanlash uchun galereyaga ruxsat berishingiz lozim.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const selectedImage = result.assets[0];
      setUploading(true);

      const formData = new FormData();
      formData.append("file", {
        uri: selectedImage.uri,
        name: selectedImage.fileName || "avatar.jpg",
        type: selectedImage.mimeType || "image/jpeg",
      } as any);

      const response = await apiClient.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const uploadResult = response.data;
      if (uploadResult.url) {
        const updateRes = await updateUser({ avatarUrl: uploadResult.url });
        if (updateRes.success) {
          Alert.alert("✅ Muvaffaqiyatli", "Profil rasmi muvaffaqiyatli yuklandi!");
        } else {
          Alert.alert("Xato", "Profil rasmini saqlashda xatolik yuz berdi.");
        }
      }
    } catch (error: any) {
      Alert.alert("Xato", error?.message || "Rasm yuklashda muammo yuz berdi");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert("Xato", "Ism bo'sh bo'lmasin");
      return;
    }
    if (form.password && form.password !== form.confirmPassword) {
      Alert.alert("Xato", "Parollar mos kelmadi");
      return;
    }
    if (form.password && form.password.length < 6) {
      Alert.alert("Xato", "Parol kamida 6 ta belgi bo'lishi kerak");
      return;
    }

    setSaving(true);
    const updateData: any = {
      name: form.name.trim(),
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
    };
    if (form.password) updateData.password = form.password;

    const result = await updateUser(updateData);
    setSaving(false);

    if (result.success) {
      setEditVisible(false);
      Alert.alert("✅ Muvaffaqiyatli", "Profil yangilandi!");
    } else {
      Alert.alert("Xato", result.message || "Yangilashda muammo yuz berdi");
    }
  };

  const roleLabel: Record<string, string> = {
    admin: "Admin",
    manager: "Menejer",
    owner: "Egasi",
    student: "Talaba",
  };

  const roleColor: Record<string, string> = {
    admin: "#EF4444",
    manager: "#6366F1",
    owner: "#F59E0B",
    student: "#10B981",
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title="Profil" subtitle="Mening ma'lumotlarim" />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

        {/* ── Avatar + Name ── */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity activeOpacity={0.8} onPress={handleChooseAvatar}>
              {user?.avatarUrl ? (
                <Image
                  source={{ uri: user.avatarUrl.startsWith("http") ? user.avatarUrl : `${BASE_URL}${user.avatarUrl}` }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={[styles.avatarFallback, { backgroundColor: roleColor[user?.role || "manager"] || COLORS.primary }]}>
                  <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || "U"}</Text>
                </View>
              )}
              {uploading && (
                <View style={styles.avatarLoader}>
                  <ActivityIndicator color="white" />
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.editBadge} onPress={handleChooseAvatar}>
              <Camera color="white" size={13} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.userName, { color: theme.text }]}>
            {user?.name || "Foydalanuvchi"}
          </Text>
          <View style={[styles.roleBadge, { backgroundColor: (roleColor[user?.role || ""] || COLORS.primary) + "20" }]}>
            <Text style={[styles.roleText, { color: roleColor[user?.role || ""] || COLORS.primary }]}>
              {roleLabel[user?.role || ""] || user?.role?.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* ── Info card ── */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Shaxsiy ma'lumotlar
        </Text>

        <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
          <InfoRow icon={User} iconBg="#EEF2FF" iconColor="#6366F1" label="To'liq ism" value={user?.name || "—"} isDark={isDarkMode} />
          <InfoRow icon={Mail} iconBg="#ECFDF5" iconColor="#10B981" label="Email manzili" value={user?.email || "—"} isDark={isDarkMode} />
          <InfoRow icon={Phone} iconBg="#FFF7ED" iconColor="#F59E0B" label="Telefon raqam" value={user?.phone || "Kiritilmagan"} isDark={isDarkMode} />
          <InfoRow icon={Shield} iconBg="#FEF2F2" iconColor="#EF4444" label="ID" value={`ID-${(user?.id || user?._id || "XXXXXX").toString().substring(0, 8).toUpperCase()}`} isDark={isDarkMode} isLast />
        </View>

        {/* ── Edit Button ── */}
        <TouchableOpacity style={styles.editBtn} onPress={openEdit}>
          <Edit2 color="white" size={18} />
          <Text style={styles.editBtnText}>Profilni tahrirlash</Text>
        </TouchableOpacity>

        {/* ── Manager extras ── */}
        {user?.role === "manager" && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Obuna va To'lov
            </Text>
            <MenuItem icon={Crown} iconBg="#EEF2FF" iconColor={COLORS.primary} label="Obuna holati" onPress={() => navigation.navigate("Subscription")} theme={theme} />
            <MenuItem icon={CreditCard} iconBg="#ECFDF5" iconColor={COLORS.secondary} label="To'lov kartasi" onPress={() => navigation.navigate("CardManagement")} theme={theme} />
          </>
        )}

        {/* ── Settings ── */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Ilova sozlamalari
        </Text>
        <MenuItem
          icon={isDarkMode ? Sun : Moon}
          iconBg={isDarkMode ? "#334155" : "#F1F5F9"}
          iconColor={isDarkMode ? "#F59E0B" : "#6366F1"}
          label={isDarkMode ? "Yorug' rejim" : "Tungi rejim"}
          onPress={toggleTheme}
          theme={theme}
        />
        <MenuItem icon={Bell} iconBg={isDarkMode ? "#334155" : "#F1F5F9"} iconColor={COLORS.gray[500]} label="Bildirishnomalar" onPress={() => {}} theme={theme} />
        <MenuItem icon={LogOut} iconBg="#FEF2F2" iconColor={COLORS.danger} label="Chiqish" onPress={logout} theme={theme} danger />

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Edit Modal ── */}
      <Modal visible={editVisible} transparent animationType="slide" onRequestClose={() => setEditVisible(false)}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={[styles.modalSheet, { backgroundColor: theme.card }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Profilni tahrirlash</Text>
              <TouchableOpacity onPress={() => setEditVisible(false)} style={styles.closeBtn}>
                <X color={theme.textSecondary} size={22} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>

              <FieldGroup label="To'liq ism" icon={User} theme={theme} isDark={isDarkMode}>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: isDarkMode ? "#334155" : COLORS.gray[200] }]}
                  value={form.name}
                  onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
                  placeholder="Ismingizni kiriting"
                  placeholderTextColor={theme.textSecondary}
                />
              </FieldGroup>

              <FieldGroup label="Email" icon={Mail} theme={theme} isDark={isDarkMode}>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: isDarkMode ? "#334155" : COLORS.gray[200] }]}
                  value={form.email}
                  onChangeText={(v) => setForm((p) => ({ ...p, email: v }))}
                  placeholder="Email manzilingiz"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </FieldGroup>

              <FieldGroup label="Telefon" icon={Phone} theme={theme} isDark={isDarkMode}>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: isDarkMode ? "#334155" : COLORS.gray[200] }]}
                  value={form.phone}
                  onChangeText={(v) => setForm((p) => ({ ...p, phone: v }))}
                  placeholder="+998 90 123 45 67"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="phone-pad"
                />
              </FieldGroup>

              <View style={[styles.divider, { borderColor: isDarkMode ? "#334155" : "#F1F5F9" }]}>
                <Text style={[styles.dividerText, { color: theme.textSecondary }]}>Parolni o'zgartirish (ixtiyoriy)</Text>
              </View>

              <FieldGroup label="Yangi parol" icon={Lock} theme={theme} isDark={isDarkMode}>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: isDarkMode ? "#334155" : COLORS.gray[200] }]}
                  value={form.password}
                  onChangeText={(v) => setForm((p) => ({ ...p, password: v }))}
                  placeholder="Yangi parol (bo'sh qoldiring o'zgartirmaslik uchun)"
                  placeholderTextColor={theme.textSecondary}
                  secureTextEntry
                />
              </FieldGroup>

              <FieldGroup label="Parolni tasdiqlang" icon={CheckCircle} theme={theme} isDark={isDarkMode}>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: isDarkMode ? "#334155" : COLORS.gray[200] }]}
                  value={form.confirmPassword}
                  onChangeText={(v) => setForm((p) => ({ ...p, confirmPassword: v }))}
                  placeholder="Parolni qaytaring"
                  placeholderTextColor={theme.textSecondary}
                  secureTextEntry
                />
              </FieldGroup>

              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <CheckCircle color="white" size={20} />
                    <Text style={styles.saveBtnText}>Saqlash</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

// ── Helpers ────────────────────────────────────────────────────────────────

function InfoRow({ icon: Icon, iconBg, iconColor, label, value, isDark, isLast }: any) {
  return (
    <View style={[styles.infoRow, isLast && { borderBottomWidth: 0 }, { borderBottomColor: isDark ? "#1e293b" : "#F1F5F9" }]}>
      <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
        <Icon color={iconColor} size={18} />
      </View>
      <View style={styles.infoTextContainer}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, { color: isDark ? "#f8fafc" : "#111827" }]}>{value}</Text>
      </View>
    </View>
  );
}

function MenuItem({ icon: Icon, iconBg, iconColor, label, onPress, theme, danger }: any) {
  return (
    <TouchableOpacity
      style={[styles.menuCard, { backgroundColor: theme.card }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuRow}>
        <View style={[styles.menuIcon, { backgroundColor: iconBg }]}>
          <Icon color={iconColor} size={20} />
        </View>
        <Text style={[styles.menuText, { color: danger ? COLORS.danger : theme.text }]}>{label}</Text>
      </View>
      <ChevronRight color={danger ? COLORS.danger : theme.textSecondary} size={18} />
    </TouchableOpacity>
  );
}

function FieldGroup({ label, icon: Icon, theme, isDark, children }: any) {
  return (
    <View style={styles.fieldGroup}>
      <View style={styles.fieldLabel}>
        <Icon color={COLORS.primary} size={15} />
        <Text style={[styles.fieldLabelText, { color: theme.textSecondary }]}>{label}</Text>
      </View>
      {children}
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1, marginTop: -30 },
  scrollContent: { paddingHorizontal: SIZES.padding, paddingBottom: 40 },

  profileHeader: { alignItems: "center", marginBottom: 28, paddingTop: 8 },
  avatarContainer: { position: "relative", marginBottom: 14 },
  avatarFallback: {
    width: 100, height: 100, borderRadius: 50,
    alignItems: "center", justifyContent: "center", ...SHADOWS.medium,
  },
  avatarImage: {
    width: 100, height: 100, borderRadius: 50,
    ...SHADOWS.medium,
  },
  avatarLoader: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 40, fontWeight: "bold", color: "white" },
  editBadge: {
    position: "absolute", right: 0, bottom: 0,
    backgroundColor: COLORS.primary, width: 30, height: 30, borderRadius: 15,
    alignItems: "center", justifyContent: "center", borderWidth: 2.5, borderColor: "white",
  },
  userName: { fontSize: 22, fontWeight: "800", marginBottom: 6 },
  roleBadge: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  roleText: { fontSize: 13, fontWeight: "700", letterSpacing: 0.5 },

  sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 12, marginTop: 20 },

  infoCard: { borderRadius: 20, padding: 4, ...SHADOWS.soft, marginBottom: 16 },
  infoRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 1 },
  iconBox: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  infoTextContainer: { marginLeft: 14, flex: 1 },
  infoLabel: { fontSize: 11, color: COLORS.gray[400], marginBottom: 2 },
  infoValue: { fontSize: 15, fontWeight: "600" },

  editBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 14,
    marginBottom: 8, ...SHADOWS.medium,
  },
  editBtnText: { color: "white", fontWeight: "700", fontSize: 15 },

  menuCard: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 10, ...SHADOWS.soft,
  },
  menuRow: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
  menuIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  menuText: { fontSize: 16, fontWeight: "600" },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 12, maxHeight: "92%" },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#CBD5E1", alignSelf: "center", marginBottom: 16 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 24, marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: "800" },
  closeBtn: { padding: 4, backgroundColor: "rgba(0,0,0,0.06)", borderRadius: 20 },
  modalBody: { paddingHorizontal: 24, paddingBottom: 36 },

  fieldGroup: { marginBottom: 16 },
  fieldLabel: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  fieldLabelText: { fontSize: 13, fontWeight: "600" },
  input: {
    borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, fontWeight: "500",
  },

  divider: { borderTopWidth: 1, paddingTop: 16, marginBottom: 16 },
  dividerText: { fontSize: 12, fontWeight: "600", textAlign: "center", marginBottom: 8 },

  saveBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 14,
    marginTop: 8, ...SHADOWS.medium,
  },
  saveBtnText: { color: "white", fontWeight: "700", fontSize: 16 },
});

export default ProfileScreen;
