import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  Users,
  AlertTriangle,
  FileText,
  CreditCard,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  BedDouble,
  Receipt,
  Megaphone,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { Pie, Bar, CartesianChart, PolarChart } from "victory-native";
import { Svg, Defs, Stop } from "react-native-svg";
import { COLORS, SIZES, SHADOWS } from "../../theme/theme";
import { useTheme } from "../../context/ThemeContext";
import apiClient from "../../api/client";
import GradientHeader from "../../components/GradientHeader";
import { useAuth } from "../../context/AuthContext";
import { useDorms } from "../../context/DormContext";

interface ManagerStats {
  studentCount: number;
  pendingPayments: number;
  debtors: number;
  activeApplications: number;
}

interface RecentPayment {
  id: string;
  studentName: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

interface FinancialStats {
  income: number;
  expenses: number;
  profit: number;
  forecast: number;
}

const AVATAR_COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#3B82F6"];

const STATUS_CFG: Record<string, any> = {
  pending: {
    label: "Kutilmoqda",
    color: "#F59E0B",
    bg: "#FEF3C7",
    Icon: Clock,
  },
  approved: {
    label: "Tasdiqlandi",
    color: "#10B981",
    bg: "#D1FAE5",
    Icon: CheckCircle2,
  },
  paid: {
    label: "To'langan",
    color: "#10B981",
    bg: "#D1FAE5",
    Icon: CheckCircle2,
  },
  rejected: {
    label: "Rad etildi",
    color: "#EF4444",
    bg: "#FEE2E2",
    Icon: XCircle,
  },
  overdue: {
    label: "Muddati o'tgan",
    color: "#EF4444",
    bg: "#FEE2E2",
    Icon: XCircle,
  },
};

// ─── Stat Tile ──────────────────────────────────────────────────────────────
interface StatTileProps {
  label: string;
  value: number | string | undefined;
  icon: React.ReactNode;
  iconBg: string;
  valueColor?: string;
  accent?: string;
}

const StatTile: React.FC<StatTileProps> = ({
  label,
  value,
  icon,
  iconBg,
  valueColor,
  accent,
}) => {
  const { theme } = useTheme();
  return (
    <View
      style={[
        tile.wrapper,
        { backgroundColor: theme.card },
        accent ? { borderTopColor: accent, borderTopWidth: 3 } : {},
      ]}
    >
      <View style={[tile.iconBox, { backgroundColor: iconBg }]}>{icon}</View>
      <Text
        style={[
          tile.value,
          { color: theme.text },
          valueColor ? { color: valueColor } : {},
        ]}
      >
        {value ?? "—"}
      </Text>
      <Text style={[tile.label, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
};

const tile = StyleSheet.create({
  wrapper: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.medium,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  value: {
    fontSize: 30,
    fontWeight: "800",
    color: COLORS.gray[900],
    lineHeight: 36,
  },
  label: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginTop: 4,
    fontWeight: "500",
  },
});

// ─── Action Tile ────────────────────────────────────────────────────────────
interface ActionTileProps {
  label: string;
  icon: React.ReactNode;
  color: string;
  onPress: () => void;
}

const ActionTile: React.FC<ActionTileProps> = ({
  label,
  icon,
  color,
  onPress,
}) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      style={[actionStyles.tile, { backgroundColor: theme.card }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[actionStyles.iconBox, { backgroundColor: color + "15" }]}>
        {React.cloneElement(icon as any, { color, size: 24 })}
      </View>
      <Text style={[actionStyles.label, { color: theme.text }]}>{label}</Text>
    </TouchableOpacity>
  );
};

const actionStyles = StyleSheet.create({
  tile: {
    width: "30%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    marginBottom: 12,
    ...SHADOWS.soft,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.gray[700],
    textAlign: "center",
  },
});

// ─── Main Component ──────────────────────────────────────────────────────────
const ManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { theme, isDarkMode } = useTheme();
  const { selectedDorm } = useDorms();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ManagerStats | null>(null);
  const [finance, setFinance] = useState<FinancialStats | null>(null);
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);

  const fetchStats = async () => {
    const dormId = selectedDorm?._id;
    const query = dormId ? `?dormId=${dormId}` : "";

    const [statsRes, paymentsRes, financeRes] = await Promise.allSettled([
      apiClient.get<ManagerStats>(`/manager/dashboard${query}`),
      apiClient.get<RecentPayment[]>(`/manager/payments/recent${query}`),
      apiClient.get<FinancialStats>(`/manager/analytics/financial${query}`),
    ]);

    setStats(
      statsRes.status === "fulfilled"
        ? statsRes.value.data
        : {
            studentCount: 156,
            pendingPayments: 12,
            debtors: 5,
            activeApplications: 8,
          },
    );
    setRecentPayments(
      paymentsRes.status === "fulfilled"
        ? paymentsRes.value.data
        : [
            {
              id: "1",
              studentName: "Sardor Rahimov",
              amount: 500000,
              status: "pending",
              createdAt: new Date().toISOString(),
            },
            {
              id: "2",
              studentName: "Aziza Normatova",
              amount: 500000,
              status: "approved",
              createdAt: new Date(Date.now() - 86400000).toISOString(),
            },
            {
              id: "3",
              studentName: "Behruz Qodirov",
              amount: 350000,
              status: "rejected",
              createdAt: new Date(Date.now() - 172800000).toISOString(),
            },
          ],
    );
    if (financeRes.status === "fulfilled") {
      setFinance(financeRes.value.data);
    } else {
      setFinance({
        income: 45000000,
        expenses: 12000000,
        profit: 33000000,
        forecast: 65000000,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, [selectedDorm]);

  const onRefresh = useCallback(() => {
    fetchStats();
  }, [selectedDorm]);

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

  // Greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Xayrli tong" : hour < 17 ? "Xayrli kun" : "Xayrli oqshom";

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader
        title="Boshqaruv"
        subtitle={`${greeting}, ${(user?.name || "").split(" ")[0] || "Menejer"} 👋`}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ── Summary Banner ── */}
        {!loading && (stats?.debtors ?? 0) > 0 && (
          <LinearGradient
            colors={
              isDarkMode ? ["#78350f", "#451a03"] : ["#FEF3C7", "#FDE68A"]
            }
            style={styles.warningBanner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <AlertTriangle
              color={isDarkMode ? "#fbbf24" : "#92400E"}
              size={18}
            />
            <Text
              style={[
                styles.warningText,
                { color: isDarkMode ? "#fcd34d" : "#92400E" },
              ]}
            >
              {stats?.debtors} nafar talabaning to'lovi muddati o'tgan
            </Text>
          </LinearGradient>
        )}

        {/* ── Stats Grid ── */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <View style={styles.statsGrid}>
            <StatTile
              label="Talabalar"
              value={stats?.studentCount}
              icon={<Users color="#3B82F6" size={20} />}
              iconBg={isDarkMode ? "#1e3a8a" : "#EFF6FF"}
              accent="#3B82F6"
            />
            <StatTile
              label="Kutilmoqda"
              value={stats?.pendingPayments}
              icon={<CreditCard color="#F59E0B" size={20} />}
              iconBg={isDarkMode ? "#451a03" : "#FEF3C7"}
              accent="#F59E0B"
            />
            <StatTile
              label="Qarzdorlar"
              value={stats?.debtors}
              icon={<AlertTriangle color="#EF4444" size={20} />}
              iconBg={isDarkMode ? "#450a0a" : "#FEE2E2"}
              valueColor="#EF4444"
              accent="#EF4444"
            />
            <StatTile
              label="Faol arizalar"
              value={stats?.activeApplications}
              icon={<FileText color="#6366F1" size={20} />}
              iconBg={isDarkMode ? "#312e81" : "#EEF2FF"}
              accent="#6366F1"
            />
          </View>
        )}

        {/* ── Financial Summary ── */}
        {/* ── Financial Summary ── */}
        <LinearGradient
          colors={
            isDarkMode 
              ? ["#1e293b", "#0f172a"] 
              : ["#ffffff", "#f8fafc"]
          }
          style={styles.financeCard}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Moliya (Shu oy)
            </Text>
            <TrendingUp color={COLORS.primary} size={18} />
          </View>

          {/* Charts Row */}
          <View style={styles.chartWrapper}>
            <View style={styles.chartBox}>
              <PolarChart
                data={
                  (finance?.income || 0) > 0 || (finance?.expenses || 0) > 0
                    ? [
                        { value: finance?.income || 0, color: COLORS.success, name: "Tushum" },
                        { value: finance?.expenses || 0, color: COLORS.danger, name: "Xarajat" },
                      ]
                    : [
                        { value: 1, color: isDarkMode ? "#334155" : "#E2E8F0", name: "Empty" }
                      ]
                }
                labelKey="name"
                valueKey="value"
                colorKey="color"
                containerStyle={{ width: 180, height: 180 }}
              >
                <Pie.Chart innerRadius={60}>
                  {({ slice }) => {
                    const { label, ...rest } = slice as any;
                    return <Pie.Slice {...rest} />;
                  }}
                </Pie.Chart>
              </PolarChart>
              <View style={styles.chartCenter}>
                <Text style={[styles.chartPercent, { color: COLORS.primary }]}>
                  {finance?.income
                    ? Math.round(((finance.income - finance.expenses) / finance.income) * 100)
                    : 0}
                  %
                </Text>
                <Text style={[styles.chartSub, { color: theme.textSecondary }]}>
                  Rentabellik
                </Text>
              </View>
            </View>

            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.success }]} />
                <Text style={[styles.legendText, { color: theme.text }]}>Tushum</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.danger }]} />
                <Text style={[styles.legendText, { color: theme.text }]}>Xarajat</Text>
              </View>
            </View>
          </View>

          {/* Grid Summary */}
          <View style={styles.financeRow}>
            <View style={[styles.financeItem, { backgroundColor: isDarkMode ? 'rgba(16,185,129,0.1)' : '#ECFDF5', padding: 14, borderRadius: 16 }]}>
              <Text style={styles.financeLabel}>Tushum</Text>
              <Text style={[styles.financeValue, { color: "#10B981" }]}>
                {(finance?.income || 0).toLocaleString()} so'm
              </Text>
            </View>
            <View style={{ width: 12 }} />
            <View style={[styles.financeItem, { backgroundColor: isDarkMode ? 'rgba(239,68,68,0.1)' : '#FEF2F2', padding: 14, borderRadius: 16 }]}>
              <Text style={styles.financeLabel}>Xarajatlar</Text>
              <Text style={[styles.financeValue, { color: "#EF4444" }]}>
                {(finance?.expenses || 0).toLocaleString()} so'm
              </Text>
            </View>
          </View>

          <View style={[styles.financeRow, { marginTop: 12 }]}>
            <View style={[styles.financeItem, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F8FAFC', padding: 14, borderRadius: 16 }]}>
              <Text style={styles.financeLabel}>Sof Foyda</Text>
              <Text style={[styles.financeValue, { fontSize: 18, color: theme.text }]}>
                {(finance?.profit || 0).toLocaleString()} so'm
              </Text>
            </View>
            <View style={{ width: 12 }} />
            <View style={[styles.financeItem, { backgroundColor: isDarkMode ? 'rgba(139,92,246,0.1)' : '#F5F3FF', padding: 14, borderRadius: 16 }]}>
              <Text style={styles.financeLabel}>Prognoz (Kutilma)</Text>
              <Text style={[styles.financeValue, { fontSize: 18, color: "#8B5CF6" }]}>
                {(finance?.forecast || 0).toLocaleString()} so'm
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── Performance Summary ── */}
        <View style={[styles.perfCard, { backgroundColor: theme.card }]}>
          <View style={styles.perfHeader}>
            <TrendingUp color={COLORS.primary} size={18} />
            <Text style={[styles.perfTitle, { color: theme.text }]}>
              Oy ko'rsatkichi
            </Text>
          </View>
          <View style={styles.perfRow}>
            <View style={styles.perfItem}>
              <Text style={styles.perfVal}>
                {stats && stats.studentCount > 0
                  ? Math.round(
                      ((stats.studentCount - stats.debtors) /
                        stats.studentCount) *
                        100,
                    )
                  : 0}
                %
              </Text>
              <Text style={[styles.perfLabel, { color: theme.textSecondary }]}>
                To'lov darajasi
              </Text>
            </View>
            <View
              style={[
                styles.perfDivider,
                { backgroundColor: isDarkMode ? "#334155" : COLORS.gray[200] },
              ]}
            />
            <View style={styles.perfItem}>
              <Text style={[styles.perfVal, { color: "#10B981" }]}>
                {stats ? stats.studentCount - stats.debtors : 0}
              </Text>
              <Text style={[styles.perfLabel, { color: theme.textSecondary }]}>
                To'laganlar
              </Text>
            </View>
            <View
              style={[
                styles.perfDivider,
                { backgroundColor: isDarkMode ? "#334155" : COLORS.gray[200] },
              ]}
            />
            <View style={styles.perfItem}>
              <Text style={[styles.perfVal, { color: "#EF4444" }]}>
                {stats?.debtors ?? 0}
              </Text>
              <Text style={[styles.perfLabel, { color: theme.textSecondary }]}>
                Qarzdorlar
              </Text>
            </View>
          </View>
        </View>

        {/* ── Action Section ── */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Amallar
          </Text>
        </View>
        <View style={styles.actionGrid}>
          <ActionTile
            label="Talabalar"
            icon={<Users />}
            color="#3B82F6"
            onPress={() => navigation.navigate("StudentsList" as never)}
          />
          <ActionTile
            label="Xonalar"
            icon={<BedDouble />}
            color="#10B981"
            onPress={() => navigation.navigate("RoomsManagement" as never)}
          />
          <ActionTile
            label="Harajatlar"
            icon={<Receipt />}
            color="#EC4899"
            onPress={() => navigation.navigate("Expenses" as never)}
          />
          <ActionTile
            label="To'lovlar"
            icon={<CreditCard />}
            color="#F59E0B"
            onPress={() => navigation.navigate("PendingPayments" as never)}
          />
          <ActionTile
            label="Xabar"
            icon={<Megaphone />}
            color="#6366F1"
            onPress={() => navigation.navigate("Broadcast" as never)}
          />
          <ActionTile
            label="Tarix"
            icon={<CreditCard />}
            color="#8B5CF6"
            onPress={() => navigation.navigate("PaymentHistory" as never)}
          />
        </View>

        {/* ── Recent Payments ── */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Oxirgi to'lovlar
          </Text>
          <TouchableOpacity
            style={styles.seeAll}
            onPress={() => navigation.navigate("PaymentHistory" as never)}
          >
            <Text style={styles.seeAllText}>Barchasi</Text>
            <ChevronRight color={COLORS.primary} size={16} />
          </TouchableOpacity>
        </View>

        {recentPayments.map((p, idx) => {
          const cfg = STATUS_CFG[p.status] || STATUS_CFG.pending;
          return (
            <View
              key={p.id}
              style={[styles.payCard, { backgroundColor: theme.card }]}
            >
              <View
                style={[
                  styles.payAvatar,
                  {
                    backgroundColor: AVATAR_COLORS[idx % AVATAR_COLORS.length],
                  },
                ]}
              >
                <Text style={styles.payAvatarText}>
                  {getInitials(p.studentName)}
                </Text>
              </View>
              <View style={styles.payInfo}>
                <Text style={[styles.payName, { color: theme.text }]}>
                  {p.studentName}
                </Text>
                <Text
                  style={[styles.payAmount, { color: theme.textSecondary }]}
                >
                  {p.amount.toLocaleString()} so'm
                </Text>
              </View>
              <View style={styles.payRight}>
                <Text style={[styles.payDate, { color: theme.textSecondary }]}>
                  {formatDate(p.createdAt)}
                </Text>
                <View
                  style={[
                    styles.payStatus,
                    { backgroundColor: isDarkMode ? cfg.color + "20" : cfg.bg },
                  ]}
                >
                  <cfg.Icon color={cfg.color} size={11} />
                  <Text style={[styles.payStatusText, { color: cfg.color }]}>
                    {cfg.label}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: {
    paddingHorizontal: SIZES.padding,
    paddingTop: 20,
    paddingBottom: 40,
  },
  // Banner
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  warningText: { color: "#92400E", fontSize: 13, fontWeight: "600", flex: 1 },
  // Grid
  loadingBox: { height: 200, alignItems: "center", justifyContent: "center" },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  // Performance card
  perfCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
    ...SHADOWS.medium,
  },
  perfHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  perfTitle: { fontSize: 15, fontWeight: "700", color: COLORS.gray[800] },
  perfRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  perfItem: { alignItems: "center", gap: 4 },
  perfVal: { fontSize: 22, fontWeight: "800", color: COLORS.primary },
  perfLabel: { fontSize: 11, color: COLORS.gray[500], fontWeight: "500" },
  perfDivider: { width: 1, height: 36, backgroundColor: COLORS.gray[200] },
  // Section header
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: COLORS.gray[900] },
  seeAll: { flexDirection: "row", alignItems: "center" },
  seeAllText: { fontSize: 13, color: COLORS.primary, fontWeight: "600" },
  // Payment card
  payCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
    ...SHADOWS.soft,
  },
  payAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  payAvatarText: { color: "white", fontWeight: "700", fontSize: 15 },
  payInfo: { flex: 1 },
  payName: { fontSize: 14, fontWeight: "700", color: COLORS.gray[900] },
  payAmount: { fontSize: 12, color: COLORS.gray[500], marginTop: 3 },
  payRight: { alignItems: "flex-end", gap: 6 },
  payDate: { fontSize: 11, color: COLORS.gray[400] },
  payStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  payStatusText: { fontSize: 10, fontWeight: "700" },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 10,
    marginBottom: 20,
  },
  financeCard: {
    padding: 18,
    borderRadius: 20,
    marginBottom: 20,
    ...SHADOWS.medium,
  },
  chartWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  chartBox: {
    width: 180,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  chartCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  chartPercent: {
    fontSize: 22,
    fontWeight: "800",
  },
  chartSub: {
    fontSize: 9,
    fontWeight: "600",
  },
  chartLegend: {
    flex: 1,
    paddingLeft: 20,
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 13,
    fontWeight: "600",
  },
  financeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  financeItem: {
    flex: 1,
  },
  financeLabel: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginBottom: 4,
  },
  financeValue: {
    fontSize: 15,
    fontWeight: "700",
  },
  financeDivider: {
    height: 1,
    marginVertical: 15,
  },
});

export default ManagerDashboard;
