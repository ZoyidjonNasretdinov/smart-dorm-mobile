import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import {
  CreditCard,
  Calendar,
  FileCheck,
  Clock,
  AlertTriangle,
  X,
  ChevronRight,
  User,
} from "lucide-react-native";
import { COLORS, SIZES, SHADOWS } from "../../theme/theme";
import apiClient from "../../api/client";
import GradientHeader from "../../components/GradientHeader";
import { useAuth } from "../../context/AuthContext";
import { useDorms } from "../../context/DormContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../../context/ThemeContext";

interface Payment {
  id: string;
  _id?: string;
  month: string;
  amount: number;
  status: string;
  createdAt: string;
  dueDate?: string;
  studentName?: string;
  studentId?: any;
  proofUrl?: string;
}

const STATUS_CFG: Record<string, any> = {
  paid:     { label: "To'langan",      color: "#10B981", bg: "#D1FAE5", Icon: FileCheck },
  approved: { label: "Tasdiqlangan",   color: "#10B981", bg: "#D1FAE5", Icon: FileCheck },
  pending:  { label: "Kutilmoqda",     color: "#F59E0B", bg: "#FEF3C7", Icon: Clock },
  rejected: { label: "Rad etildi",     color: "#EF4444", bg: "#FEE2E2", Icon: X },
  overdue:  { label: "Muddati o'tgan", color: "#EF4444", bg: "#FEE2E2", Icon: AlertTriangle },
};

const FILTERS = [
  { key: "all",      label: "Barchasi" },
  { key: "approved", label: "Tasdiqlangan" },
  { key: "paid",     label: "To'langan" },
  { key: "pending",  label: "Kutilmoqda" },
  { key: "rejected", label: "Rad etildi" },
  { key: "overdue",  label: "Muddati o'tgan" },
];

const AVATAR_COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#EC4899"];

function getInitials(name: string) {
  if (!name) return "U";
  return name.split(" ").map((w) => w[0]).join("").substring(0, 2).toUpperCase();
}

const PaymentHistoryScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filter, setFilter] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const { selectedDorm } = useDorms();
  const { theme, isDarkMode } = useTheme();

  // If navigated from student detail, show only that student's payments
  const studentId = (route.params as any)?.studentId;
  const studentName = (route.params as any)?.studentName;

  const fetchPayments = useCallback(async () => {
    try {
      const dId = selectedDorm?._id;
      const endpoint =
        user?.role === "manager"
          ? `/manager/payments${dId ? `?dormId=${dId}` : ""}`
          : "/student/payments";

      const res = await apiClient.get(endpoint);
      let data: Payment[] = res.data;

      if (user?.role === "manager") {
        // Normalize studentName field
        data = data.map((p: any) => ({
          ...p,
          id: p._id || p.id,
          studentName: p.studentName || p.studentId?.name || "Noma'lum",
        }));
        // Filter by specific student if navigating from StudentDetail
        if (studentId) {
          data = data.filter(
            (p: any) =>
              p.studentId === studentId ||
              p.studentId?._id === studentId ||
              p.studentId?.toString() === studentId,
          );
        }
      }
      setPayments(data);
    } catch {
      // Fallback mock data
      setPayments([
        {
          id: "1", month: "Aprel 2026", amount: 627134, status: "approved",
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          studentName: "Sardor Rahimov",
          proofUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80",
        },
        {
          id: "2", month: "Mart 2026", amount: 500000, status: "paid",
          createdAt: new Date(Date.now() - 86400000 * 35).toISOString(),
          studentName: "Kamola Usmonova",
          proofUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80",
        },
        {
          id: "3", month: "Mart 2026", amount: 500000, status: "pending",
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          studentName: "Behruz Qodirov",
        },
        {
          id: "4", month: "Fevral 2026", amount: 500000, status: "overdue",
          createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
          studentName: "Dilnoza Yusupova",
        },
        {
          id: "5", month: "Yanvar 2026", amount: 500000, status: "rejected",
          createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
          studentName: "Jasur Nazarov",
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedDorm, studentId, user]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const onRefresh = () => { setRefreshing(true); fetchPayments(); };

  const filtered = filter === "all"
    ? payments
    : payments.filter((p) => p.status === filter);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("uz-UZ", { day: "2-digit", month: "long", year: "numeric" });
  };

  // ─── Render each payment row ─────────────────────────────────────────────
  const renderItem = ({ item, index }: { item: Payment; index: number }) => {
    const cfg = STATUS_CFG[item.status] || STATUS_CFG.pending;
    const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.card }]}
        activeOpacity={0.7}
        onPress={() => setSelectedPayment(item)}
      >
        {/* Avatar + info */}
        <View style={styles.cardLeft}>
          <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
            <Text style={styles.avatarText}>{getInitials(item.studentName || "")}</Text>
          </View>
          <View style={styles.cardInfo}>
            {/* Student name — tap navigates to their full history */}
            {user?.role === "manager" && item.studentName && (
              <TouchableOpacity
                onPress={() =>
                  (navigation.navigate as any)("PaymentHistory", {
                    studentId: item.studentId?._id || item.studentId,
                    studentName: item.studentName,
                  })
                }
              >
                <View style={styles.nameRow}>
                  <Text style={[styles.studentName, { color: COLORS.primary }]}>
                    {item.studentName}
                  </Text>
                  <ChevronRight color={COLORS.primary} size={14} />
                </View>
              </TouchableOpacity>
            )}
            <Text style={[styles.monthText, { color: theme.text }]}>{item.month}</Text>
            <Text style={[styles.dateText, { color: theme.textSecondary }]}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>

        {/* Amount + status */}
        <View style={styles.cardRight}>
          <Text style={[styles.amount, { color: theme.text }]}>
            {item.amount.toLocaleString()}
          </Text>
          <Text style={[styles.amountLabel, { color: theme.textSecondary }]}>so'm</Text>
          <View style={[styles.statusBadge, { backgroundColor: isDarkMode ? cfg.color + "25" : cfg.bg }]}>
            <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ─── Payment detail modal ────────────────────────────────────────────────
  const renderModal = () => {
    if (!selectedPayment) return null;
    const cfg = STATUS_CFG[selectedPayment.status] || STATUS_CFG.pending;
    const CfgIcon = cfg.Icon;

    return (
      <Modal visible transparent animationType="slide" onRequestClose={() => setSelectedPayment(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: theme.card }]}>
            {/* Handle */}
            <View style={styles.modalHandle} />

            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>To'lov tafsiloti</Text>
              <TouchableOpacity onPress={() => setSelectedPayment(null)} style={styles.closeBtn}>
                <X color={theme.textSecondary} size={22} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Status banner */}
              <View style={[styles.statusBanner, { backgroundColor: isDarkMode ? cfg.color + "20" : cfg.bg }]}>
                <CfgIcon color={cfg.color} size={24} />
                <Text style={[styles.statusBannerText, { color: cfg.color }]}>{cfg.label}</Text>
              </View>

              {/* Details */}
              {[
                { label: "Talaba", value: selectedPayment.studentName || "—" },
                { label: "Oy", value: selectedPayment.month },
                { label: "Summa", value: `${selectedPayment.amount.toLocaleString()} so'm` },
                { label: "Sana", value: formatDate(selectedPayment.createdAt) },
              ].map((row) => (
                <View key={row.label} style={[styles.detailRow, { borderBottomColor: isDarkMode ? "#334155" : "#F1F5F9" }]}>
                  <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>{row.label}</Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>{row.value}</Text>
                </View>
              ))}

              {/* Receipt */}
              <Text style={[styles.receiptTitle, { color: theme.textSecondary }]}>To'lov cheki</Text>
              {selectedPayment.proofUrl ? (
                <Image
                  source={{ uri: selectedPayment.proofUrl }}
                  style={styles.receiptImg}
                  resizeMode="contain"
                />
              ) : (
                <View style={[styles.noReceipt, { backgroundColor: isDarkMode ? "#1e293b" : "#F8FAFC" }]}>
                  <Calendar color={theme.textSecondary} size={28} />
                  <Text style={[styles.noReceiptText, { color: theme.textSecondary }]}>Chek yuklanmagan</Text>
                </View>
              )}

              {/* Go to student full history */}
              {user?.role === "manager" && selectedPayment.studentName && (
                <TouchableOpacity
                  style={styles.viewAllBtn}
                  onPress={() => {
                    setSelectedPayment(null);
                    (navigation.navigate as any)("PaymentHistory", {
                      studentId: selectedPayment.studentId?._id || selectedPayment.studentId,
                      studentName: selectedPayment.studentName,
                    });
                  }}
                >
                  <User color="white" size={18} />
                  <Text style={styles.viewAllBtnText}>
                    {selectedPayment.studentName}ning barcha to'lovlari
                  </Text>
                  <ChevronRight color="white" size={18} />
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader
        title={studentName ? `${studentName} - To'lovlar` : "To'lovlar tarixi"}
        subtitle={`${filtered.length} ta to'lov`}
        showBack={true}
        onBack={() => navigation.goBack()}
      />

      {/* ── Filter chips ── */}
      <View style={[styles.filterWrap, { backgroundColor: theme.background }]}>
        {studentName && (
          <View style={styles.activeStudentFilterRow}>
            <TouchableOpacity
              style={[styles.studentChip, { backgroundColor: COLORS.primary + "15" }]}
              onPress={() => {
                navigation.setParams({ studentId: undefined, studentName: undefined } as any);
              }}
            >
              <Text style={[styles.studentChipText, { color: COLORS.primary }]}>
                Talaba: {studentName}
              </Text>
              <View style={[styles.studentChipClose, { backgroundColor: COLORS.primary }]}>
                <X color="white" size={10} />
              </View>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {FILTERS.map((f) => {
            const active = filter === f.key;
            const cfg = STATUS_CFG[f.key];
            return (
              <TouchableOpacity
                key={f.key}
                style={[
                  styles.chip,
                  active
                    ? { backgroundColor: cfg?.color || COLORS.primary }
                    : { backgroundColor: isDarkMode ? "#1e293b" : COLORS.white, borderColor: isDarkMode ? "#334155" : COLORS.gray[200], borderWidth: 1 },
                ]}
                onPress={() => setFilter(f.key)}
              >
                <Text style={[styles.chipText, { color: active ? "white" : theme.textSecondary }]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── List ── */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <CreditCard color={COLORS.gray[300]} size={56} />
              <Text style={[styles.emptyText, { color: COLORS.gray[400] }]}>To'lovlar topilmadi</Text>
            </View>
          }
        />
      )}

      {renderModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15 },

  // Filter
  activeStudentFilterRow: { paddingHorizontal: SIZES.padding, marginBottom: 8, flexDirection: "row" },
  studentChip: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  studentChipText: { fontSize: 13, fontWeight: "700" },
  studentChipClose: { width: 16, height: 16, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  filterWrap: { paddingTop: 8, paddingBottom: 4 },
  filters: { paddingHorizontal: SIZES.padding, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  chipText: { fontSize: 13, fontWeight: "600" },

  // List
  list: { padding: SIZES.padding, gap: 12, paddingBottom: 40 },

  // Card
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    padding: 14,
    ...SHADOWS.soft,
  },
  cardLeft: { flexDirection: "row", alignItems: "center", flex: 1, gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "white", fontSize: 16, fontWeight: "700" },
  cardInfo: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  studentName: { fontSize: 13, fontWeight: "700" },
  monthText: { fontSize: 15, fontWeight: "600", marginTop: 1 },
  dateText: { fontSize: 11, marginTop: 2 },

  cardRight: { alignItems: "flex-end", gap: 4 },
  amount: { fontSize: 16, fontWeight: "800" },
  amountLabel: { fontSize: 11, marginTop: -4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: "700" },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingBottom: 36,
    maxHeight: "90%",
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#CBD5E1", alignSelf: "center", marginBottom: 16 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 24, marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: "800" },
  closeBtn: { padding: 4, backgroundColor: "rgba(0,0,0,0.06)", borderRadius: 20 },
  modalBody: { paddingHorizontal: 24, paddingBottom: 16 },

  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    marginBottom: 20,
  },
  statusBannerText: { fontSize: 16, fontWeight: "700" },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  detailLabel: { fontSize: 14 },
  detailValue: { fontSize: 14, fontWeight: "700", maxWidth: "60%", textAlign: "right" },

  receiptTitle: { fontSize: 13, fontWeight: "600", marginTop: 20, marginBottom: 10 },
  receiptImg: { width: "100%", height: 260, borderRadius: 14, backgroundColor: "#F1F5F9" },
  noReceipt: { alignItems: "center", justifyContent: "center", padding: 32, borderRadius: 14, gap: 8 },
  noReceiptText: { fontSize: 14, fontWeight: "500" },

  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 14,
    marginTop: 20,
  },
  viewAllBtnText: { color: "white", fontWeight: "700", fontSize: 14, flex: 1 },
});

export default PaymentHistoryScreen;
