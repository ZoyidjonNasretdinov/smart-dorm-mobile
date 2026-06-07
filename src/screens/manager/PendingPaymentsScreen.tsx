import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Modal,
  Image,
  ScrollView,
} from "react-native";
import {
  CreditCard,
  CheckCircle2,
  X,
  ImageIcon,
  Clock,
} from "lucide-react-native";
import { COLORS, SIZES, SHADOWS } from "../../theme/theme";
import { useTheme } from "../../context/ThemeContext";
import apiClient from "../../api/client";
import { useDorms } from "../../context/DormContext";
import GradientHeader from "../../components/GradientHeader";

interface Payment {
  id: string;
  studentName: string;
  amount: number;
  month: string;
  status: "pending" | "approved" | "rejected";
  proofUrl?: string;
  createdAt: string;
}

const STATUS_CFG: Record<string, any> = {
  pending: { label: "Kutilmoqda", color: "#F59E0B", bg: "#FEF3C7" },
  approved: { label: "Tasdiqlandi", color: "#10B981", bg: "#D1FAE5" },
  paid: { label: "To'langan", color: "#10B981", bg: "#D1FAE5" },
  rejected: { label: "Rad etildi", color: "#EF4444", bg: "#FEE2E2" },
  overdue: { label: "Muddati o'tgan", color: "#EF4444", bg: "#FEE2E2" },
};

const AVATAR_COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#3B82F6"];

const PendingPaymentsScreen: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  const { selectedDorm } = useDorms();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const fetchPayments = async () => {
    try {
      const dId = selectedDorm?._id;
      const res = await apiClient.get<Payment[]>(
        `/manager/payments/pending${dId ? `?dormId=${dId}` : ""}`,
      );
      // Vaqtinchalik demo rasm: agar to'lov cheki bo'lmasa, demo rasm qo'yiladi
      const mapped = res.data.map((p) => ({
        ...p,
        proofUrl: p.proofUrl || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80",
      }));
      setPayments(mapped);
    } catch {
      setPayments([
        {
          id: "1",
          studentName: "Sardor Rahimov",
          amount: 500000,
          month: "Mart 2026",
          status: "pending",
          createdAt: new Date().toISOString(),
          proofUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80",
        },
        {
          id: "2",
          studentName: "Kamola Usmonova",
          amount: 500000,
          month: "Mart 2026",
          status: "pending",
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
          proofUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80",
        },
        {
          id: "3",
          studentName: "Behruz Qodirov",
          amount: 500000,
          month: "Fevral 2026",
          status: "rejected",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [selectedDorm]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPayments().finally(() => setRefreshing(false));
  }, [selectedDorm]);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    const label = action === "approve" ? "tasdiqlaysizmi" : "rad etasizmi";
    Alert.alert("Tasdiqlash", `Ushbu to'lovni ${label}?`, [
      { text: "Bekor qilish", style: "cancel" },
      {
        text: action === "approve" ? "Tasdiqlash" : "Rad etish",
        style: action === "approve" ? "default" : "destructive",
        onPress: async () => {
          setProcessingId(id);
          try {
            await apiClient.patch(`/manager/payments/${id}/${action}`);
          } catch {}
          setPayments((prev) =>
            prev.map((p) =>
              p.id === id
                ? {
                    ...p,
                    status: action === "approve" ? "approved" : "rejected",
                  }
                : p,
            ),
          );
          setProcessingId(null);
          setSelectedPayment((curr) => curr?.id === id ? null : curr);
        },
      },
    ]);
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const formatDate = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return "Hozir";
    if (h < 24) return `${h} soat oldin`;
    return `${Math.floor(h / 24)} kun oldin`;
  };

  const pendingCount = payments.filter((p) => p.status === "pending").length;

  const renderItem = ({ item, index }: { item: Payment; index: number }) => {
    const cfg = STATUS_CFG[item.status] || STATUS_CFG.pending;
    const isPending = item.status === "pending";
    const isProcessing = processingId === item.id;

    return (
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: theme.card }]}
        activeOpacity={0.7}
        onPress={() => setSelectedPayment(item)}
      >
        <View style={styles.cardTop}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] },
            ]}
          >
            <Text style={styles.avatarText}>
              {getInitials(item.studentName)}
            </Text>
          </View>
          <View style={styles.info}>
            <Text style={[styles.name, { color: theme.text }]}>
              {item.studentName}
            </Text>
            <Text style={[styles.month, { color: theme.textSecondary }]}>
              {item.month}
            </Text>
          </View>
          <View>
            <Text style={[styles.amount, { color: theme.text }]}>
              {item.amount.toLocaleString()} so'm
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: isDarkMode ? cfg.color + "20" : cfg.bg },
              ]}
            >
              <Text style={[styles.statusText, { color: cfg.color }]}>
                {cfg.label}
              </Text>
            </View>
          </View>
        </View>

        {item.proofUrl ? (
          <View
            style={[
              styles.proofPreview,
              { backgroundColor: isDarkMode ? "#1e293b" : "#F8FAFC" },
            ]}
          >
            <ImageIcon color={COLORS.primary} size={16} />
            <Text style={styles.proofText}>Chek yuklangan</Text>
          </View>
        ) : (
          <View
            style={[
              styles.proofPreview,
              { backgroundColor: isDarkMode ? "#1e293b" : "#F8FAFC" },
            ]}
          >
            <Clock color={theme.textSecondary} size={14} />
            <Text style={[styles.proofText, { color: theme.textSecondary }]}>
              Cheksiz yuklangan
            </Text>
          </View>
        )}

        <Text style={[styles.date, { color: theme.textSecondary }]}>
          {formatDate(item.createdAt)}
        </Text>

        {isPending && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                styles.rejectBtn,
                { backgroundColor: isDarkMode ? "#450a0a" : "#FFF5F5" },
              ]}
              onPress={() => handleAction(item.id, "reject")}
              disabled={isProcessing}
            >
              <X color="#EF4444" size={18} />
              <Text style={[styles.actionText, { color: "#EF4444" }]}>
                Rad etish
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.approveBtn]}
              onPress={() => handleAction(item.id, "approve")}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <CheckCircle2 color="white" size={18} />
                  <Text style={[styles.actionText, { color: "white" }]}>
                    Tasdiqlash
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader
        title="To'lovlar"
        subtitle={`${pendingCount} ta kutilmoqda`}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <CreditCard color={COLORS.gray[300]} size={56} />
              <Text style={styles.emptyText}>To'lovlar yo'q</Text>
            </View>
          }
        />
      )}

      {selectedPayment && (
        <Modal
          visible={!!selectedPayment}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedPayment(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>To'lov tafsiloti</Text>
                <TouchableOpacity onPress={() => setSelectedPayment(null)} style={styles.closeBtn}>
                  <X color={theme.textSecondary} size={24} />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.modalScroll}>
                <View style={styles.modalRow}>
                  <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Talaba:</Text>
                  <Text style={[styles.modalValue, { color: theme.text }]}>{selectedPayment.studentName}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Oy:</Text>
                  <Text style={[styles.modalValue, { color: theme.text }]}>{selectedPayment.month}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Summa:</Text>
                  <Text style={[styles.modalValue, { color: theme.text }]}>{selectedPayment.amount.toLocaleString()} so'm</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Sana:</Text>
                  <Text style={[styles.modalValue, { color: theme.text }]}>{new Date(selectedPayment.createdAt).toLocaleString("uz-UZ")}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Holat:</Text>
                  <Text style={[styles.modalValue, { color: STATUS_CFG[selectedPayment.status]?.color || COLORS.primary }]}>
                    {STATUS_CFG[selectedPayment.status]?.label || "Kutilmoqda"}
                  </Text>
                </View>

                {selectedPayment.proofUrl ? (
                  <View style={styles.proofContainer}>
                    <Text style={[styles.modalLabel, { color: theme.textSecondary, marginBottom: 8 }]}>To'lov cheki:</Text>
                    <Image
                      source={{ uri: selectedPayment.proofUrl }}
                      style={styles.proofImage}
                      resizeMode="contain"
                    />
                  </View>
                ) : (
                  <View style={styles.noProofContainer}>
                    <Clock color={theme.textSecondary} size={24} />
                    <Text style={[styles.noProofText, { color: theme.textSecondary }]}>Chek yuklanmagan</Text>
                  </View>
                )}
              </ScrollView>

              {selectedPayment.status === "pending" && (
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.rejectBtn, { backgroundColor: isDarkMode ? "#450a0a" : "#FFF5F5" }]}
                    onPress={() => handleAction(selectedPayment.id, "reject")}
                    disabled={processingId === selectedPayment.id}
                  >
                    <X color="#EF4444" size={18} />
                    <Text style={[styles.actionText, { color: "#EF4444" }]}>Rad etish</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.approveBtn]}
                    onPress={() => handleAction(selectedPayment.id, "approve")}
                    disabled={processingId === selectedPayment.id}
                  >
                    {processingId === selectedPayment.id ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <>
                        <CheckCircle2 color="white" size={18} />
                        <Text style={[styles.actionText, { color: "white" }]}>Tasdiqlash</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: SIZES.padding, gap: 12 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    ...SHADOWS.soft,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: { color: "white", fontWeight: "700", fontSize: 15 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: "700", color: COLORS.gray[900] },
  month: { fontSize: 12, color: COLORS.gray[500], marginTop: 2 },
  amount: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.gray[900],
    textAlign: "right",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    marginTop: 4,
  },
  statusText: { fontSize: 11, fontWeight: "700" },
  proofPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  proofText: { fontSize: 12, color: COLORS.primary, fontWeight: "500" },
  date: { fontSize: 11, color: COLORS.gray[400], marginBottom: 12 },
  actions: { flexDirection: "row", gap: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  rejectBtn: {
    borderWidth: 1.5,
    borderColor: "#EF4444",
    backgroundColor: "#FFF5F5",
  },
  approveBtn: { backgroundColor: COLORS.primary },
  actionText: { fontWeight: "700", fontSize: 14 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
    gap: 10,
  },
  emptyText: { fontSize: 15, color: COLORS.gray[400] },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 34,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold" },
  closeBtn: {
    padding: 4,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 20,
  },
  modalScroll: { paddingHorizontal: 24, paddingBottom: 20 },
  modalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  modalLabel: { fontSize: 15, fontWeight: "500" },
  modalValue: { fontSize: 15, fontWeight: "bold" },
  proofContainer: { marginTop: 20 },
  proofImage: { width: "100%", height: 300, borderRadius: 12, backgroundColor: "rgba(0,0,0,0.03)" },
  noProofContainer: {
    marginTop: 30,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: 12,
  },
  noProofText: { marginTop: 10, fontSize: 14, fontWeight: "500" },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
});

export default PendingPaymentsScreen;
