import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
  Modal,
  Image,
} from "react-native";
import {
  User,
  Phone,
  MessageCircle,
  BedDouble,
  CreditCard,
  ChevronRight,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  X,
  AlertTriangle,
} from "lucide-react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { COLORS, SIZES, SHADOWS } from "../../theme/theme";
import { useTheme } from "../../context/ThemeContext";
import apiClient from "../../api/client";
import GradientHeader from "../../components/GradientHeader";

interface StudentDetail {
  id: string;
  name: string;
  phone: string;
  room: string;
  paymentStatus: "paid" | "partial" | "unpaid";
  email: string;
  passportNumber?: string;
  parentsPhone?: string;
  address?: string;
  joinedAt: string;
  recentPayments: Array<{
    id: string;
    amount: number;
    month: string;
    status: "approved" | "pending" | "rejected" | "paid" | "overdue";
    date: string;
    proofUrl?: string;
  }>;
}

const PAY_CONFIG: Record<string, any> = {
  paid: { label: "To'langan", color: "#10B981", bg: "#D1FAE5" },
  partial: { label: "Qismiy", color: "#F59E0B", bg: "#FEF3C7" },
  unpaid: { label: "To'lanmagan", color: "#EF4444", bg: "#FEE2E2" },
  unknown: { label: "Noma'lum", color: "#64748b", bg: "#f1f5f9" }
};

const STATUS_ICONS: Record<string, any> = {
  approved: { label: "Tasdiqlangan", Icon: CheckCircle2, color: "#10B981", bg: "#D1FAE5" },
  pending: { label: "Kutilmoqda", Icon: Clock, color: "#F59E0B", bg: "#FEF3C7" },
  rejected: { label: "Rad etilgan", Icon: XCircle, color: "#EF4444", bg: "#FEE2E2" },
  paid: { label: "To'langan", Icon: CheckCircle2, color: "#10B981", bg: "#D1FAE5" },
  overdue: { label: "Muddati o'tgan", Icon: XCircle, color: "#EF4444", bg: "#FEE2E2" },
};

export default function StudentDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { theme, isDarkMode } = useTheme();
  const { studentId } = route.params as { studentId: string };
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);

  const fetchDetail = async () => {
    try {
      const res = await apiClient.get<StudentDetail>(
        `/manager/students/${studentId}`,
      );
      setStudent(res.data);
    } catch {
      // Mock data if API fails
      setStudent({
        id: studentId,
        name: "Sardor Rahimov",
        phone: "+998 90 123 45 67",
        room: "204",
        paymentStatus: "paid",
        email: "sardor@example.com",
        passportNumber: "AA 1234567",
        parentsPhone: "+998 91 765 43 21",
        address: "Toshkent sh, Yunusobod tumani",
        joinedAt: "2025-09-01T00:00:00Z",
        recentPayments: [
          {
            id: "1",
            amount: 500000,
            month: "Mart 2026",
            status: "approved",
            date: "2026-03-05",
          },
          {
            id: "2",
            amount: 500000,
            month: "Fevral 2026",
            status: "approved",
            date: "2026-02-04",
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, []);

  const handleCall = () => {
    if (student?.phone) {
      Linking.openURL(`tel:${student.phone}`);
    }
  };

  const handleChat = () => {
    (navigation.navigate as any)("ChatRoom", {
      userId: student?.id,
      userName: student?.name,
    });
  };

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!student) return null;

  const payInfoState = PAY_CONFIG[student.paymentStatus] || PAY_CONFIG.unknown;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader
        title="Talaba ma'lumoti"
        showBack={true}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: theme.card }]}>
          <View style={styles.avatarLarge}>
            <User color="white" size={40} />
          </View>
          <Text style={[styles.name, { color: theme.text }]}>
            {student.name}
          </Text>
          <View
            style={[
              styles.payBadge,
              {
                backgroundColor: isDarkMode
                  ? payInfoState.color + "20"
                  : payInfoState.bg,
              },
            ]}
          >
            <Text style={[styles.payText, { color: payInfoState.color }]}>
              {payInfoState.label}
            </Text>
          </View>

          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#3B82F6" }]}
              onPress={handleCall}
            >
              <Phone color="white" size={20} />
              <Text style={styles.actionBtnText}>Qo'ng'iroq</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}
              onPress={handleChat}
            >
              <MessageCircle color="white" size={20} />
              <Text style={styles.actionBtnText}>Chat</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Blocks */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Asosiy ma'lumotlar
          </Text>
          <View style={[styles.infoList, { backgroundColor: theme.card }]}>
            <InfoRow
              icon={BedDouble}
              label="Xona"
              value={`${student.room}-xona`}
            />
            <InfoRow icon={Phone} label="Telefon" value={student.phone} />
            <InfoRow
              icon={FileText}
              label="Passport"
              value={student.passportNumber ?? "—"}
            />
            <InfoRow
              icon={User}
              label="Ota-ona teli"
              value={student.parentsPhone ?? "—"}
            />
            <InfoRow
              icon={Calendar}
              label="A'zo bo'lgan"
              value={new Date(student.joinedAt).toLocaleDateString()}
              isLast
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              To'lovlar tarixi
            </Text>
            <TouchableOpacity onPress={() => (navigation.navigate as any)("PaymentHistory", { studentId: student.id })}>
              <Text style={styles.seeAll}>Barchasi</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.infoList, { backgroundColor: theme.card }]}>
            {student.recentPayments.map((p, idx) => {
              const cfg = STATUS_ICONS[p.status] || STATUS_ICONS.pending;
              return (
                <TouchableOpacity
                  key={p.id}
                  activeOpacity={0.7}
                  onPress={() => setSelectedPayment(p)}
                  style={[
                    styles.paymentRow,
                    idx === student.recentPayments.length - 1 &&
                      styles.noBorder,
                  ]}
                >
                  <View style={styles.paymentRowInfo}>
                    <Text style={[styles.payMonth, { color: theme.text }]}>
                      {p.month}
                    </Text>
                    <Text
                      style={[styles.payDate, { color: theme.textSecondary }]}
                    >
                      {p.date}
                    </Text>
                  </View>
                  <View style={styles.payRight}>
                    <Text style={[styles.payAmount, { color: theme.text }]}>
                      {p.amount.toLocaleString()} so'm
                    </Text>
                    <View style={styles.payStatus}>
                      <cfg.Icon color={cfg.color} size={12} />
                      <Text
                        style={[styles.payStatusText, { color: cfg.color }]}
                      >
                        {cfg.label || p.status}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ─── Detail Modal ─── */}
      <Modal
        visible={!!selectedPayment}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedPayment(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: theme.card }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                To'lov cheki ma'lumoti
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedPayment(null)}
                style={styles.closeBtn}
              >
                <X color={theme.textSecondary} size={22} />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              {selectedPayment && (
                <>
                  <View
                    style={[
                      styles.statusBanner,
                      {
                        backgroundColor:
                          (STATUS_ICONS[selectedPayment.status]?.color ||
                            COLORS.primary) + "15",
                      },
                    ]}
                  >
                    {React.createElement(
                      STATUS_ICONS[selectedPayment.status]?.Icon || Clock,
                      {
                        color:
                          STATUS_ICONS[selectedPayment.status]?.color ||
                          COLORS.primary,
                        size: 24,
                      }
                    )}
                    <Text
                      style={[
                        styles.statusBannerText,
                        {
                          color:
                            STATUS_ICONS[selectedPayment.status]?.color ||
                            COLORS.primary,
                        },
                      ]}
                    >
                      {STATUS_ICONS[selectedPayment.status]?.label ||
                        selectedPayment.status}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.detailRow,
                      { borderBottomColor: isDarkMode ? "#334155" : "#F1F5F9" },
                    ]}
                  >
                    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                      Talaba
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.text }]}>
                      {student.name}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.detailRow,
                      { borderBottomColor: isDarkMode ? "#334155" : "#F1F5F9" },
                    ]}
                  >
                    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                      Oy nomi
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.text }]}>
                      {selectedPayment.month}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.detailRow,
                      { borderBottomColor: isDarkMode ? "#334155" : "#F1F5F9" },
                    ]}
                  >
                    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                      Summa
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.text }]}>
                      {selectedPayment.amount.toLocaleString()} so'm
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.detailRow,
                      { borderBottomColor: isDarkMode ? "#334155" : "#F1F5F9" },
                    ]}
                  >
                    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                      Sana
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.text }]}>
                      {selectedPayment.date}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.receiptTitle,
                      { color: theme.textSecondary, marginTop: 20 },
                    ]}
                  >
                    To'lov cheki (Rasm)
                  </Text>
                  {selectedPayment.proofUrl ? (
                    <Image
                      source={{ uri: selectedPayment.proofUrl }}
                      style={styles.receiptImg}
                      resizeMode="contain"
                    />
                  ) : (
                    <View
                      style={[
                        styles.noReceipt,
                        {
                          backgroundColor: isDarkMode ? "#1e293b" : "#F8FAFC",
                        },
                      ]}
                    >
                      <AlertTriangle color={theme.textSecondary} size={28} />
                      <Text
                        style={[
                          styles.noReceiptText,
                          { color: theme.textSecondary },
                        ]}
                      >
                        Chek yuklanmagan
                      </Text>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const InfoRow = ({ icon: Icon, label, value, isLast }: any) => {
  const { theme, isDarkMode } = useTheme();
  return (
    <View
      style={[
        styles.infoRow,
        isLast && styles.noBorder,
        { borderBottomColor: isDarkMode ? "#334155" : "#F1F5F9" },
      ]}
    >
      <View style={styles.infoLabelRow}>
        <Icon color={COLORS.primary} size={18} />
        <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
          {label}
        </Text>
      </View>
      <Text style={[styles.infoValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: SIZES.padding },
  profileCard: {
    alignItems: "center",
    padding: 24,
    borderRadius: 24,
    ...SHADOWS.medium,
    marginBottom: 20,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  name: { fontSize: 22, fontWeight: "800", marginBottom: 8 },
  payBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  payText: { fontSize: 13, fontWeight: "700" },
  quickActions: { flexDirection: "row", gap: 12 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  actionBtnText: { color: "white", fontWeight: "700", fontSize: 14 },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 12 },
  seeAll: { color: COLORS.primary, fontWeight: "600", fontSize: 14 },
  infoList: { borderRadius: 20, padding: 4, ...SHADOWS.soft },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  infoLabelRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  infoLabel: { fontSize: 14 },
  infoValue: { fontSize: 14, fontWeight: "600" },
  noBorder: { borderBottomWidth: 0 },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  paymentRowInfo: { flex: 1 },
  payMonth: { fontSize: 15, fontWeight: "700" },
  payDate: { fontSize: 12, marginTop: 2 },
  payRight: { alignItems: "flex-end" },
  payAmount: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
  payStatus: { flexDirection: "row", alignItems: "center", gap: 4 },
  payStatusText: { fontSize: 11, fontWeight: "600" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 12, paddingBottom: 36, maxHeight: "90%" },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#CBD5E1", alignSelf: "center", marginBottom: 16 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 24, marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: "800" },
  closeBtn: { padding: 4, backgroundColor: "rgba(0,0,0,0.06)", borderRadius: 20 },
  modalBody: { paddingHorizontal: 24, paddingBottom: 16 },
  statusBanner: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 14, marginBottom: 20 },
  statusBannerText: { fontSize: 16, fontWeight: "700" },
  detailRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 14, borderBottomWidth: 1 },
  detailLabel: { fontSize: 14 },
  detailValue: { fontSize: 14, fontWeight: "700", maxWidth: "60%", textAlign: "right" },
  receiptTitle: { fontSize: 13, fontWeight: "600", marginTop: 20, marginBottom: 10 },
  receiptImg: { width: "100%", height: 260, borderRadius: 14, backgroundColor: "#F1F5F9" },
  noReceipt: { alignItems: "center", justifyContent: "center", padding: 32, borderRadius: 14, gap: 8 },
  noReceiptText: { fontSize: 14, fontWeight: "500" },
});
