import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  Star,
  Check,
  Clock,
  AlertTriangle,
  Building2,
  Zap,
} from "lucide-react-native";
import { COLORS, SIZES, SHADOWS } from "../../theme/theme";
import apiClient from "../../api/client";
import GradientHeader from "../../components/GradientHeader";
import { useAuth } from "../../context/AuthContext";

interface Subscription {
  _id: string;
  plan: "basic" | "standard" | "premium";
  price: number;
  maxDorms: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const PLANS = [
  {
    key: "basic",
    label: "Oddiy",
    price: 200000,
    maxDorms: 1,
    color: "#6366F1",
    bg: "#EDE9FE",
    features: ["1 ta hotel", "Asosiy funksiyalar", "Talabalar boshqaruvi"],
  },
  {
    key: "standard",
    label: "O'rtacha",
    price: 400000,
    maxDorms: 3,
    color: "#10B981",
    bg: "#D1FAE5",
    features: ["3 tagacha hotel", "Harajatlar tahlili", "Chat tizimi"],
    badge: "💡 Mashhur",
  },
  {
    key: "premium",
    label: "Yuqori",
    price: 700000,
    maxDorms: 9999,
    color: "#F59E0B",
    bg: "#FEF3C7",
    features: ["Cheksiz hotel", "To'liq tahlil", "Ustuvor qo'llab-quvvatlash"],
    badge: "⭐ Premium",
  },
];

const formatMoney = (n: number) => n.toLocaleString("uz-UZ") + " so'm/oy";
const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}.${d.getFullYear()}`;
};
const daysLeft = (iso: string) => {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

export default function SubscriptionScreen() {
  const { user } = useAuth();
  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  useEffect(() => {
    fetchSub();
  }, []);

  const fetchSub = async () => {
    try {
      const res = await apiClient.get<Subscription>("/subscription/my");
      setSub(res.data);
    } catch {
      // Mock
      setSub({
        _id: "s1",
        plan: "standard",
        price: 400000,
        maxDorms: 3,
        startDate: new Date(Date.now() - 15 * 86400000).toISOString(),
        endDate: new Date(Date.now() + 15 * 86400000).toISOString(),
        isActive: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planKey: string) => {
    Alert.alert(
      "Tarifni o'zgartirish",
      `${PLANS.find((p) => p.key === planKey)?.label} tarifiga o'tishni xohlaysizmi?`,
      [
        { text: "Bekor", style: "cancel" },
        {
          text: "Tasdiqlash",
          onPress: async () => {
            setSubscribing(planKey);
            try {
              const res = await apiClient.post<Subscription>(
                "/manager/subscribe",
                {
                  plan: planKey,
                },
              );
              setSub(res.data);
              Alert.alert(
                "✅ Muvaffaqiyat",
                "Tarif muvaffaqiyatli o'zgartirildi!",
              );
            } catch (e: any) {
              Alert.alert(
                "Xato",
                e.response?.data?.message || "Xatolik yuz berdi",
              );
            } finally {
              setSubscribing(null);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const remaining = sub ? daysLeft(sub.endDate) : 0;
  const isExpired = sub ? !sub.isActive || remaining === 0 : true;
  const currentPlan = PLANS.find((p) => p.key === sub?.plan);

  return (
    <View style={styles.container}>
      <GradientHeader title="Obuna" subtitle="Tarif boshqaruvi" />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Current Plan Card */}
        {sub && (
          <View
            style={[
              styles.currentCard,
              {
                borderColor: isExpired
                  ? COLORS.danger
                  : currentPlan?.color || COLORS.primary,
              },
            ]}
          >
            <View style={styles.currentCardHeader}>
              <View
                style={[
                  styles.currentIcon,
                  { backgroundColor: currentPlan?.bg },
                ]}
              >
                <Star color={currentPlan?.color || COLORS.primary} size={24} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.currentLabel}>Joriy tarif</Text>
                <Text
                  style={[
                    styles.currentPlanName,
                    { color: currentPlan?.color },
                  ]}
                >
                  {currentPlan?.label || sub.plan}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: isExpired ? "#FEE2E2" : "#D1FAE5" },
                ]}
              >
                {isExpired ? (
                  <AlertTriangle color="#EF4444" size={14} />
                ) : (
                  <Check color="#10B981" size={14} />
                )}
                <Text
                  style={[
                    styles.statusText,
                    { color: isExpired ? "#EF4444" : "#10B981" },
                  ]}
                >
                  {isExpired ? "Muddati o'tgan" : "Faol"}
                </Text>
              </View>
            </View>

            <View style={styles.currentStats}>
              <StatItem
                icon={<Building2 color={COLORS.gray[500]} size={15} />}
                label="Maks. hotel"
                value={sub.maxDorms >= 9999 ? "Cheksiz" : `${sub.maxDorms} ta`}
              />
              <StatItem
                icon={<Clock color={COLORS.gray[500]} size={15} />}
                label="Muddati"
                value={formatDate(sub.endDate)}
              />
              <StatItem
                icon={<Zap color={COLORS.gray[500]} size={15} />}
                label={isExpired ? "Yakunlangan" : "Qolgan kunlar"}
                value={isExpired ? "0 kun" : `${remaining} kun`}
                valueColor={remaining < 7 ? COLORS.danger : COLORS.success}
              />
            </View>

            {!isExpired && remaining < 7 && (
              <View style={styles.warningBanner}>
                <AlertTriangle color="#F59E0B" size={14} />
                <Text style={styles.warningText}>
                  Obuna {remaining} kundan so'ng tugaydi. Yangilashni unutmang!
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Plan Cards */}
        <Text style={styles.sectionTitle}>Tarifni tanlang</Text>

        {PLANS.map((plan) => {
          const isCurrent = sub?.plan === plan.key;
          return (
            <View
              key={plan.key}
              style={[
                styles.planCard,
                isCurrent && { borderColor: plan.color, borderWidth: 2 },
              ]}
            >
              {plan.badge && (
                <View style={[styles.planBadge, { backgroundColor: plan.bg }]}>
                  <Text style={[styles.planBadgeText, { color: plan.color }]}>
                    {plan.badge}
                  </Text>
                </View>
              )}

              <View style={styles.planHeader}>
                <View style={[styles.planIcon, { backgroundColor: plan.bg }]}>
                  <Star color={plan.color} size={20} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.planName, { color: plan.color }]}>
                    {plan.label}
                  </Text>
                  <Text style={styles.planPrice}>
                    {formatMoney(plan.price)}
                  </Text>
                </View>
                {isCurrent && (
                  <View
                    style={[styles.currentChip, { backgroundColor: plan.bg }]}
                  >
                    <Text
                      style={[styles.currentChipText, { color: plan.color }]}
                    >
                      Joriy
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.featureList}>
                {plan.features.map((f) => (
                  <View key={f} style={styles.featureRow}>
                    <Check color={plan.color} size={14} />
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.subscribeBtn,
                  { backgroundColor: isCurrent ? plan.bg : plan.color },
                  subscribing !== null && { opacity: 0.7 },
                ]}
                onPress={() => !isCurrent && handleSubscribe(plan.key)}
                disabled={isCurrent || subscribing !== null}
              >
                {subscribing === plan.key ? (
                  <ActivityIndicator color={isCurrent ? plan.color : "white"} />
                ) : (
                  <Text
                    style={[
                      styles.subscribeBtnText,
                      { color: isCurrent ? plan.color : "white" },
                    ]}
                  >
                    {isCurrent ? "Joriy tarif" : "Bu tarifni tanlash"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const StatItem = ({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
}) => (
  <View style={styles.statItem}>
    {icon}
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, valueColor ? { color: valueColor } : {}]}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { padding: SIZES.padding, paddingBottom: 40 },

  currentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 2,
    padding: 18,
    marginBottom: 24,
    ...SHADOWS.medium,
  },
  currentCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  currentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  currentLabel: { fontSize: 12, color: COLORS.gray[400], fontWeight: "600" },
  currentPlanName: { fontSize: 20, fontWeight: "800" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusText: { fontSize: 12, fontWeight: "700" },

  currentStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statLabel: {
    fontSize: 10,
    color: COLORS.gray[400],
    fontWeight: "600",
    textAlign: "center",
  },
  statValue: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.gray[900],
    textAlign: "center",
  },

  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF3C7",
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
  },
  warningText: { flex: 1, fontSize: 12, color: "#92400E" },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.gray[800],
    marginBottom: 12,
  },
  planCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: COLORS.gray[200],
    ...SHADOWS.soft,
  },
  planBadge: {
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
  },
  planBadgeText: { fontSize: 12, fontWeight: "700" },
  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  planIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  planName: { fontSize: 17, fontWeight: "700" },
  planPrice: { fontSize: 14, color: COLORS.gray[500], fontWeight: "600" },
  currentChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  currentChipText: { fontSize: 12, fontWeight: "700" },

  featureList: { gap: 6, marginBottom: 16 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  featureText: { fontSize: 13, color: COLORS.gray[700] },

  subscribeBtn: {
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
  },
  subscribeBtnText: { fontSize: 15, fontWeight: "700" },
});
