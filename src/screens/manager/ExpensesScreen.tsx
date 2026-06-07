import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Zap,
  Flame,
  Wifi,
  Package,
  TrendingUp,
  Users,
} from "lucide-react-native";
import { COLORS, SIZES, SHADOWS } from "../../theme/theme";
import { useTheme } from "../../context/ThemeContext";
import apiClient from "../../api/client";
import GradientHeader from "../../components/GradientHeader";
import { useDorms } from "../../context/DormContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Expense {
  _id: string;
  category: string;
  amount: number;
  month: string;
  note?: string;
  createdAt: string;
}

const CATEGORIES = [
  {
    key: "water",
    label: "Suv",
    emoji: "💧",
    IconComp: Droplets,
    color: "#3B82F6",
    bg: "#DBEAFE",
  },
  {
    key: "electricity",
    label: "Elektr",
    emoji: "⚡",
    IconComp: Zap,
    color: "#F59E0B",
    bg: "#FEF3C7",
  },
  {
    key: "gas",
    label: "Gaz",
    emoji: "🔥",
    IconComp: Flame,
    color: "#EF4444",
    bg: "#FEE2E2",
  },
  {
    key: "wifi",
    label: "WiFi",
    emoji: "📶",
    IconComp: Wifi,
    color: "#6366F1",
    bg: "#EDE9FE",
  },
  {
    key: "other",
    label: "Boshqa",
    emoji: "📦",
    IconComp: Package,
    color: "#10B981",
    bg: "#D1FAE5",
  },
];

const formatMoney = (n: number) => n.toLocaleString("uz-UZ") + " so'm";

const getMonthLabel = (m: string) => {
  const [y, mo] = m.split("-");
  const names = [
    "Yanvar",
    "Fevral",
    "Mart",
    "Aprel",
    "May",
    "Iyun",
    "Iyul",
    "Avgust",
    "Sentyabr",
    "Oktyabr",
    "Noyabr",
    "Dekabr",
  ];
  return `${names[parseInt(mo) - 1]} ${y}`;
};

const prevMonth = (m: string) => {
  let [y, mo] = m.split("-").map(Number);
  mo--;
  if (mo < 1) {
    mo = 12;
    y--;
  }
  return `${y}-${String(mo).padStart(2, "0")}`;
};
const nextMonth = (m: string) => {
  let [y, mo] = m.split("-").map(Number);
  mo++;
  if (mo > 12) {
    mo = 1;
    y++;
  }
  return `${y}-${String(mo).padStart(2, "0")}`;
};
const currentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export default function ExpensesScreen() {
  const { theme, isDarkMode } = useTheme();
  const { selectedDorm } = useDorms();
  const [month, setMonth] = useState(currentMonth());
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categoryTotals, setCategoryTotals] = useState<Record<string, number>>(
    {},
  );
  const [studentCount, setStudentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selCategory, setSelCategory] = useState("water");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (selectedDorm) fetchAll();
  }, [selectedDorm, month]);

  const fetchAll = async () => {
    setLoading(true);
    const dId = selectedDorm?._id || "";
    try {
      const [expRes, catRes, studRes] = await Promise.all([
        apiClient.get<Expense[]>(`/expenses?dormId=${dId}&month=${month}`),
        apiClient.get<Record<string, number>>(
          `/expenses/categories?dormId=${dId}&month=${month}`,
        ),
        apiClient.get<{ count: number }>(`/manager/students/count`),
      ]);
      setExpenses(expRes.data);
      setCategoryTotals(catRes.data);
      setStudentCount(studRes.data.count || 0);
    } catch {
      // Mock fallback
      const mock: Expense[] = [
        {
          _id: "1",
          category: "water",
          amount: 450000,
          month,
          createdAt: new Date().toISOString(),
        },
        {
          _id: "2",
          category: "electricity",
          amount: 820000,
          month,
          createdAt: new Date().toISOString(),
        },
        {
          _id: "3",
          category: "wifi",
          amount: 300000,
          month,
          createdAt: new Date().toISOString(),
        },
      ];
      setExpenses(mock);
      setCategoryTotals({
        water: 450000,
        electricity: 820000,
        gas: 0,
        wifi: 300000,
        other: 0,
      });
      setStudentCount(24);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAll().finally(() => setRefreshing(false));
  }, [selectedDorm, month]);

  const totalExpenses = Object.values(categoryTotals).reduce(
    (a, b) => a + b,
    0,
  );
  const perStudent =
    studentCount > 0 ? Math.round(totalExpenses / studentCount) : 0;

  const handleCreate = async () => {
    const amt = parseInt(amount.replace(/\s/g, ""));
    if (!amt || amt <= 0) {
      Alert.alert("Xato", "Summa kiriting");
      return;
    }
    setCreating(true);
    try {
      await apiClient.post("/expenses", {
        dormId: selectedDorm?._id,
        category: selCategory,
        amount: amt,
        month,
        note: note.trim() || undefined,
      });
      setShowCreate(false);
      setAmount("");
      setNote("");
      fetchAll();
    } catch (e: any) {
      Alert.alert("Xato", e.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("O'chirish", "Bu harajatni o'chirmoqchimisiz?", [
      { text: "Bekor", style: "cancel" },
      {
        text: "O'chirish",
        style: "destructive",
        onPress: async () => {
          try {
            await apiClient.delete(`/expenses/${id}`);
            fetchAll();
          } catch {
            Alert.alert("Xato", "O'chirishda xatolik");
          }
        },
      },
    ]);
  };

  const getCat = (key: string) =>
    CATEGORIES.find((c) => c.key === key) || CATEGORIES[4];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title="Harajatlar" subtitle={getMonthLabel(month)} />

      {/* Month Picker */}
      <View
        style={[
          styles.monthPicker,
          {
            backgroundColor: theme.card,
            borderBottomColor: isDarkMode ? "#334155" : COLORS.gray[100],
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.monthArrow,
            { backgroundColor: isDarkMode ? "#1e293b" : COLORS.gray[100] },
          ]}
          onPress={() => setMonth(prevMonth(month))}
        >
          <ChevronLeft color={COLORS.primary} size={20} />
        </TouchableOpacity>
        <Text style={[styles.monthLabel, { color: theme.text }]}>
          {getMonthLabel(month)}
        </Text>
        <TouchableOpacity
          style={[
            styles.monthArrow,
            { backgroundColor: isDarkMode ? "#1e293b" : COLORS.gray[100] },
          ]}
          onPress={() => setMonth(nextMonth(month))}
        >
          <ChevronRight color={COLORS.primary} size={20} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
        >
          {/* Summary Cards */}
          <View style={styles.summaryRow}>
            <View
              style={[
                styles.summaryCard,
                { flex: 1.3, backgroundColor: theme.card },
              ]}
            >
              <TrendingUp color={COLORS.primary} size={20} />
              <Text
                style={[styles.summaryLabel, { color: theme.textSecondary }]}
              >
                Jami harajat
              </Text>
              <Text style={[styles.summaryAmount, { color: COLORS.primary }]}>
                {formatMoney(totalExpenses)}
              </Text>
            </View>
            <View
              style={[
                styles.summaryCard,
                { flex: 1, backgroundColor: theme.card },
              ]}
            >
              <Users color="#10B981" size={20} />
              <Text
                style={[styles.summaryLabel, { color: theme.textSecondary }]}
              >
                Har talabaga
              </Text>
              <Text style={[styles.summaryAmount, { color: "#10B981" }]}>
                {formatMoney(perStudent)}
              </Text>
            </View>
          </View>

          {/* Category Breakdown */}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Kategoriyalar bo'yicha
          </Text>
          <View style={styles.catGrid}>
            {CATEGORIES.map((cat) => {
              const total = categoryTotals[cat.key] || 0;
              return (
                <View
                  key={cat.key}
                  style={[
                    styles.catCard,
                    { backgroundColor: isDarkMode ? cat.color + "20" : cat.bg },
                  ]}
                >
                  <Text style={styles.catEmoji}>{cat.emoji}</Text>
                  <Text
                    style={[
                      styles.catLabel,
                      { color: isDarkMode ? theme.text : cat.color },
                    ]}
                  >
                    {cat.label}
                  </Text>
                  <Text
                    style={[
                      styles.catAmount,
                      { color: isDarkMode ? theme.text : cat.color },
                    ]}
                  >
                    {total > 0 ? formatMoney(total) : "—"}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Expense List */}
          <View style={styles.listHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Kiritilgan harajatlar
            </Text>
            <Text style={[styles.countLabel, { color: theme.textSecondary }]}>
              {expenses.length} ta
            </Text>
          </View>

          {expenses.length === 0 ? (
            <View style={styles.emptyBox}>
              <Package color={COLORS.gray[300]} size={40} />
              <Text style={styles.emptyText}>Bu oyda harajat yo'q</Text>
            </View>
          ) : (
            expenses.map((exp) => {
              const cat = getCat(exp.category);
              return (
                <View
                  key={exp._id}
                  style={[styles.expenseCard, { backgroundColor: theme.card }]}
                >
                  <View
                    style={[
                      styles.expenseDot,
                      {
                        backgroundColor: isDarkMode ? cat.color + "20" : cat.bg,
                      },
                    ]}
                  >
                    <Text style={styles.expenseEmoji}>{cat.emoji}</Text>
                  </View>
                  <View style={styles.expenseInfo}>
                    <Text style={[styles.expenseCat, { color: theme.text }]}>
                      {cat.label}
                    </Text>
                    {exp.note && (
                      <Text
                        style={[
                          styles.expenseNote,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {exp.note}
                      </Text>
                    )}
                  </View>
                  <Text style={[styles.expenseAmount, { color: cat.color }]}>
                    {formatMoney(exp.amount)}
                  </Text>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(exp._id)}
                  >
                    <X color={theme.textSecondary} size={16} />
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowCreate(true)}>
        <Plus color="white" size={24} />
      </TouchableOpacity>

      {/* Create Modal */}
      <Modal visible={showCreate} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={[styles.modalSheet, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Harajat qo'shish
              </Text>
              <TouchableOpacity onPress={() => setShowCreate(false)}>
                <X color={theme.textSecondary} size={22} />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Kategoriya</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 16 }}
            >
              <View style={{ flexDirection: "row", gap: 8 }}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.key}
                    style={[
                      styles.catChip,
                      selCategory === cat.key && {
                        borderColor: cat.color,
                        backgroundColor: cat.bg,
                      },
                    ]}
                    onPress={() => setSelCategory(cat.key)}
                  >
                    <Text style={styles.catChipEmoji}>{cat.emoji}</Text>
                    <Text
                      style={[
                        styles.catChipText,
                        selCategory === cat.key && {
                          color: cat.color,
                          fontWeight: "700",
                        },
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
              Summa (so'm) *
            </Text>
            <TextInput
              style={[
                styles.fieldInput,
                {
                  color: theme.text,
                  borderColor: isDarkMode ? "#334155" : COLORS.gray[200],
                },
              ]}
              value={amount}
              onChangeText={setAmount}
              placeholder="Masalan: 500000"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
            />

            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
              Izoh (ixtiyoriy)
            </Text>
            <TextInput
              style={[
                styles.fieldInput,
                {
                  marginBottom: 20,
                  color: theme.text,
                  borderColor: isDarkMode ? "#334155" : COLORS.gray[200],
                },
              ]}
              value={note}
              onChangeText={setNote}
              placeholder="Qisqa izoh..."
              placeholderTextColor={theme.textSecondary}
            />

            <TouchableOpacity
              style={[styles.primaryBtn, creating && { opacity: 0.7 }]}
              onPress={handleCreate}
              disabled={creating}
            >
              {creating ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.primaryBtnText}>Saqlash</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  scrollContent: { padding: SIZES.padding, paddingBottom: 100 },

  monthPicker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  monthArrow: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: COLORS.gray[100],
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.gray[900],
    minWidth: 140,
    textAlign: "center",
  },

  summaryRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    gap: 6,
    ...SHADOWS.soft,
  },
  summaryLabel: { fontSize: 12, color: COLORS.gray[500], fontWeight: "600" },
  summaryAmount: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.primary,
    textAlign: "center",
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.gray[800],
    marginBottom: 10,
  },
  catGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  catCard: {
    width: "30%",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  catEmoji: { fontSize: 22 },
  catLabel: { fontSize: 11, fontWeight: "700" },
  catAmount: { fontSize: 11, fontWeight: "600", textAlign: "center" },

  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  countLabel: { fontSize: 13, color: COLORS.gray[400] },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    gap: 10,
  },
  emptyText: { fontSize: 14, color: COLORS.gray[400] },

  expenseCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
    ...SHADOWS.soft,
  },
  expenseDot: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  expenseEmoji: { fontSize: 20 },
  expenseInfo: { flex: 1 },
  expenseCat: { fontSize: 14, fontWeight: "700", color: COLORS.gray[900] },
  expenseNote: { fontSize: 12, color: COLORS.gray[400], marginTop: 2 },
  expenseAmount: { fontSize: 14, fontWeight: "700" },
  deleteBtn: { padding: 4 },

  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.medium,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: COLORS.gray[900] },

  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.gray[600],
    marginBottom: 6,
  },
  fieldInput: {
    borderWidth: 1.5,
    borderColor: COLORS.gray[200],
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.gray[900],
    marginBottom: 14,
  },

  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: COLORS.gray[200],
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  catChipEmoji: { fontSize: 16 },
  catChipText: { fontSize: 13, color: COLORS.gray[600] },

  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  primaryBtnText: { color: "white", fontSize: 16, fontWeight: "700" },
});
