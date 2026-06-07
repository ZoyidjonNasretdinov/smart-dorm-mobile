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
import { Check, Crown, Zap, ShieldCheck } from "lucide-react-native";
import { COLORS, SIZES, SHADOWS } from "../../theme/theme";
import { useTheme } from "../../context/ThemeContext";
import GradientHeader from "../../components/GradientHeader";
import DashboardCard from "../../components/DashboardCard";
import apiClient from "../../api/client";

const SubscriptionScreen: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subRes, plansRes] = await Promise.all([
        apiClient.get("/subscription/me"),
        apiClient.get("/subscription/plans"),
      ]);
      setCurrentSubscription(subRes.data);
      setPlans(plansRes.data);
    } catch (error) {
      console.error("Error fetching subscription data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan: string) => {
    setSubscribing(plan);
    try {
      await apiClient.post("/subscription/subscribe", { plan });
      Alert.alert("Muvaffaqiyatli", "Obuna muvaffaqiyatli yangilandi!");
      fetchData();
    } catch (error) {
      Alert.alert("Xatolik", "Obuna bo'lishda xatolik yuz berdi.");
    } finally {
      setSubscribing(null);
    }
  };

  if (loading) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.background }]}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader
        title="Obuna Tizimi"
        subtitle="O'zingizga mos tarifni tanlang"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {currentSubscription && (
          <DashboardCard
            style={[styles.currentCard, { backgroundColor: theme.card }]}
          >
            <View style={styles.currentHeader}>
              <View style={styles.crownCircle}>
                <Crown color="white" size={20} />
              </View>
              <View>
                <Text
                  style={[styles.currentTitle, { color: theme.textSecondary }]}
                >
                  Sizning joriy obunangiz
                </Text>
                <Text style={[styles.currentPlan, { color: COLORS.primary }]}>
                  {currentSubscription.plan === "basic"
                    ? "BOSHLANG'ICH"
                    : currentSubscription.plan === "standard"
                      ? "STANDART"
                      : "PREMIUM"}{" "}
                  REJA
                </Text>
              </View>
            </View>
            <View style={styles.expiryBadge}>
              <Text style={styles.expiryText}>
                Muddati:{" "}
                {new Date(currentSubscription.endDate).toLocaleDateString(
                  "uz-UZ",
                )}{" "}
                gacha
              </Text>
            </View>
          </DashboardCard>
        )}

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Tariflar
        </Text>

        {plans.map((plan) => (
          <TouchableOpacity
            key={plan.name}
            activeOpacity={0.8}
            onPress={() => handleSubscribe(plan.name)}
            disabled={
              subscribing !== null || currentSubscription?.plan === plan.name
            }
          >
            <DashboardCard
              style={[
                styles.planCard,
                { backgroundColor: theme.card },
                currentSubscription?.plan === plan.name &&
                  styles.activePlanCard,
                plan.name === "premium" && styles.premiumPlanCard,
              ]}
            >
              {plan.name === "premium" && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>TAVSIYA ETILADI</Text>
                </View>
              )}

              <View style={styles.planHeader}>
                <View
                  style={[
                    styles.planIcon,
                    {
                      backgroundColor:
                        plan.name === "basic"
                          ? "#EEF2FF"
                          : plan.name === "standard"
                            ? "#ECFDF5"
                            : "#FFF7ED",
                    },
                  ]}
                >
                  {plan.name === "basic" && (
                    <Zap color={COLORS.primary} size={28} />
                  )}
                  {plan.name === "standard" && (
                    <ShieldCheck color={COLORS.secondary} size={28} />
                  )}
                  {plan.name === "premium" && (
                    <Crown color={COLORS.warning} size={28} />
                  )}
                </View>
                <View style={styles.planTitleContainer}>
                  <Text style={[styles.planName, { color: theme.text }]}>
                    {plan.name === "basic"
                      ? "Boshlang'ich"
                      : plan.name === "standard"
                        ? "Standart"
                        : "Premium"}
                  </Text>
                  <Text style={styles.planSubtitle}>
                    {plan.name === "basic"
                      ? "Kichik dormlar uchun"
                      : plan.name === "standard"
                        ? "O'rta biznes uchun"
                        : "Katta tarmoqlar uchun"}
                  </Text>
                </View>
              </View>

              <View style={styles.priceContainer}>
                <Text style={[styles.priceValue, { color: theme.text }]}>
                  {plan.price.toLocaleString()}
                </Text>
                <Text style={styles.priceCurrency}>so'm / oy</Text>
              </View>

              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <View style={styles.checkIcon}>
                    <Check color="white" size={12} />
                  </View>
                  <Text style={[styles.featureText, { color: theme.text }]}>
                    {plan.name === "basic"
                      ? "1 ta filial"
                      : plan.name === "standard"
                        ? "3 ta filialgacha"
                        : "3+ filial (Cheksiz)"}
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={styles.checkIcon}>
                    <Check color="white" size={12} />
                  </View>
                  <Text style={[styles.featureText, { color: theme.text }]}>
                    Barcha boshqaruv panellari
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={styles.checkIcon}>
                    <Check color="white" size={12} />
                  </View>
                  <Text style={[styles.featureText, { color: theme.text }]}>
                    24/7 Texnik yordam
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.subscribeButton,
                  {
                    backgroundColor:
                      currentSubscription?.plan === plan.name
                        ? COLORS.gray[200]
                        : plan.name === "premium"
                          ? COLORS.warning
                          : COLORS.primary,
                  },
                ]}
                onPress={() => handleSubscribe(plan.name)}
                disabled={
                  subscribing !== null ||
                  currentSubscription?.plan === plan.name
                }
              >
                {subscribing === plan.name ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text
                    style={[
                      styles.subscribeButtonText,
                      {
                        color:
                          currentSubscription?.plan === plan.name
                            ? COLORS.gray[500]
                            : "white",
                      },
                    ]}
                  >
                    {currentSubscription?.plan === plan.name
                      ? "Amaldagi tarif"
                      : "Faollashtirish"}
                  </Text>
                )}
              </TouchableOpacity>
            </DashboardCard>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  scroll: { flex: 1, marginTop: -30 },
  scrollContent: { paddingHorizontal: SIZES.padding, paddingBottom: 40 },
  currentCard: {
    marginBottom: 25,
    padding: 20,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderLeftWidth: 5,
    borderLeftColor: COLORS.primary,
  },
  currentHeader: { flexDirection: "row", alignItems: "center", gap: 15 },
  crownCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.warning,
    alignItems: "center",
    justifyContent: "center",
  },
  currentTitle: { fontSize: 13, fontWeight: "600", opacity: 0.7 },
  currentPlan: { fontSize: 20, fontWeight: "bold" },
  expiryBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  expiryText: { fontSize: 11, color: COLORS.gray[500], fontWeight: "600" },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 10,
  },
  planCard: {
    marginBottom: 20,
    padding: 25,
    borderRadius: 24,
    overflow: "hidden",
  },
  activePlanCard: { borderColor: COLORS.primary, borderWidth: 2 },
  premiumPlanCard: { borderColor: COLORS.warning, borderWidth: 1 },
  recommendedBadge: {
    position: "absolute",
    top: 20,
    right: -30,
    backgroundColor: COLORS.warning,
    paddingHorizontal: 40,
    paddingVertical: 5,
    transform: [{ rotate: "45deg" }],
  },
  recommendedText: { color: "white", fontSize: 10, fontWeight: "bold" },
  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginBottom: 20,
  },
  planIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  planTitleContainer: { flex: 1 },
  planName: { fontSize: 22, fontWeight: "800" },
  planSubtitle: { fontSize: 14, color: COLORS.gray[400], marginTop: 2 },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 25,
  },
  priceValue: { fontSize: 32, fontWeight: "800" },
  priceCurrency: {
    fontSize: 16,
    color: COLORS.gray[400],
    marginLeft: 8,
    fontWeight: "600",
  },
  featuresList: { gap: 12, marginBottom: 25 },
  featureItem: { flexDirection: "row", alignItems: "center", gap: 12 },
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.success,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: { fontSize: 16, fontWeight: "500" },
  subscribeButton: {
    padding: 16,
    borderRadius: 15,
    alignItems: "center",
    ...SHADOWS.medium,
  },
  subscribeButtonText: { fontWeight: "bold", fontSize: 17 },
});

export default SubscriptionScreen;
