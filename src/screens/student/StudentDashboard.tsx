import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import {
  Home as HomeIcon,
  CreditCard,
  MessageSquare,
  Bed,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { COLORS, SIZES } from "../../theme/theme";
import apiClient from "../../api/client";
import GradientHeader from "../../components/GradientHeader";
import DashboardCard from "../../components/DashboardCard";

interface DashboardData {
  student: {
    name: string;
    room: string;
    joinDate: string;
    status: string;
  };
  room: {
    number: string;
    type: string;
    floor: number;
    roommates: number;
    price: string;
    capacity: number;
  };
  payments: Array<{
    id: string;
    month: string;
    amount: string;
    status: "paid" | "pending";
    dueDate: string;
  }>;
}

const StudentDashboard: React.FC = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const response = await apiClient.get<DashboardData>("/student/dashboard");
      setData(response.data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Ma'lumotlarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, []);

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const currentPayment = data?.payments?.[0];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <GradientHeader
        title={data?.student?.name || "Talaba"}
        subtitle="Salom,"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        <DashboardCard
          title="Joriy xona"
          icon={<Bed color={COLORS.primary} size={20} />}
        >
          <View style={styles.roomMainInfo}>
            <Text style={styles.roomNumber}>
              {data?.room?.number || "301-xona"}
            </Text>
          </View>
          <View style={styles.roomSubInfo}>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Qavat</Text>
              <Text style={styles.infoValue}>
                {data?.room?.floor || "3"}-qavat
              </Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Yotoq</Text>
              <Text style={styles.infoValue}>
                {data?.room?.capacity || "2"}-yotoq
              </Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Narx</Text>
              <Text style={styles.infoValue}>
                {data?.room?.price || "500 000"} so'm
              </Text>
            </View>
          </View>
        </DashboardCard>

        <DashboardCard
          title="To'lov holati"
          badge={currentPayment?.status === "paid" ? "To'langan" : "Kutilmoqda"}
          badgeType={currentPayment?.status === "paid" ? "success" : "warning"}
          icon={<CreditCard color={COLORS.primary} size={20} />}
        >
          <View style={styles.paymentMainInfo}>
            <Text style={styles.paymentMonth}>
              {currentPayment?.month || "Mart 2026"}
            </Text>
            <TouchableOpacity>
              <Text style={styles.linkText}>Tarixni ko'rish</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.paymentSubInfo}>
            <Text style={styles.infoLabel}>Keyingi to'lov muddati</Text>
            <Text style={styles.infoValue}>
              {currentPayment?.dueDate || "1-aprel, 2026"}
            </Text>
          </View>
        </DashboardCard>

        <Text style={styles.sectionTitle}>Tez amallar</Text>

        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => navigation.navigate("RoomDetails")}
        >
          <DashboardCard
            style={[styles.actionCard, { marginBottom: 12 }] as any}
            showArrow
          >
            <View style={styles.actionRow}>
              <View style={[styles.actionIcon, { backgroundColor: "#3B82F6" }]}>
                <HomeIcon color="white" size={20} />
              </View>
              <Text style={styles.actionText}>Mening xonam</Text>
            </View>
          </DashboardCard>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionItem}
          onPress={() =>
            navigation.navigate("HomeTab", { screen: "PaymentUpload" })
          }
        >
          <DashboardCard
            style={[styles.actionCard, { marginBottom: 12 }] as any}
            showArrow
          >
            <View style={styles.actionRow}>
              <View style={[styles.actionIcon, { backgroundColor: "#10B981" }]}>
                <CreditCard color="white" size={20} />
              </View>
              <Text style={styles.actionText}>To'lov yuklash</Text>
            </View>
          </DashboardCard>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}>
          <DashboardCard
            style={[styles.actionCard, { marginBottom: 12 }] as any}
            showArrow
          >
            <View style={styles.actionRow}>
              <View style={[styles.actionIcon, { backgroundColor: "#F59E0B" }]}>
                <MessageSquare color="white" size={20} />
              </View>
              <Text style={styles.actionText}>Ariza yuborish</Text>
            </View>
          </DashboardCard>
        </TouchableOpacity>
      </ScrollView>
    </View>
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  roomMainInfo: {
    marginBottom: 16,
  },
  roomNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.gray[900],
  },
  roomSubInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 16,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.gray[400],
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.gray[900],
  },
  paymentMainInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  paymentMonth: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.gray[900],
  },
  linkText: {
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  paymentSubInfo: {
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.gray[900],
    marginTop: 10,
    marginBottom: 16,
  },
  actionItem: {
    width: "100%",
  },
  actionCard: {
    paddingVertical: 12,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.gray[900],
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
  },
});

export default StudentDashboard;
