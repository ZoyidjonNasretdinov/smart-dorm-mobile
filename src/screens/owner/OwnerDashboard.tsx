import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
} from "react-native";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
} from "lucide-react-native";
import { COLORS, SIZES } from "../../theme/theme";
import apiClient from "../../api/client";
import GradientHeader from "../../components/GradientHeader";
import DashboardCard from "../../components/DashboardCard";

interface OwnerStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  studentCount: number;
  occupancyRate: string;
}

const OwnerDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<OwnerStats | null>(null);

  const fetchStats = async () => {
    try {
      const response = await apiClient.get<OwnerStats>("/owner/dashboard");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching owner stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatCurrency = (val: number) => {
    return val.toLocaleString() + " so'm";
  };

  return (
    <View style={styles.container}>
      <GradientHeader title="Moliyaviy hisobot" subtitle="Bino egasi" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchStats}
            colors={[COLORS.primary]}
          />
        }
      >
        <DashboardCard
          title="Umumiy tushum"
          icon={<TrendingUp color="#10B981" size={20} />}
          badge="Joriy oy"
          badgeType="success"
        >
          <Text style={styles.mainValue}>
            {formatCurrency(stats?.totalRevenue || 0)}
          </Text>
          <Text style={styles.subText}>
            Kutilgan barcha to'lovlar jamlamasi
          </Text>
        </DashboardCard>

        <View style={styles.row}>
          <DashboardCard
            title="Xarajatlar"
            style={styles.halfCard}
            icon={<TrendingDown color="#EF4444" size={20} />}
          >
            <Text style={styles.smallValue}>
              {formatCurrency(stats?.totalExpenses || 0)}
            </Text>
          </DashboardCard>

          <DashboardCard
            title="Foyda"
            style={styles.halfCard}
            icon={<DollarSign color="#3B82F6" size={20} />}
          >
            <Text style={[styles.smallValue, { color: "#10B981" }]}>
              {formatCurrency(stats?.netProfit || 0)}
            </Text>
          </DashboardCard>
        </View>

        <Text style={styles.sectionTitle}>Bandlik holati</Text>
        <DashboardCard
          title="Xonalar bandligi"
          icon={<PieChart color="#6366F1" size={20} />}
        >
          <View style={styles.occupancyRow}>
            <View>
              <Text style={styles.statValue}>
                {stats?.occupancyRate || "0%"}
              </Text>
              <Text style={styles.statLabel}>To'lish ko'rsatkichi</Text>
            </View>
            <View>
              <Text style={styles.statValue}>{stats?.studentCount || 0}</Text>
              <Text style={styles.statLabel}>Jami talabalar</Text>
            </View>
          </View>
        </DashboardCard>
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
  mainValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.gray[900],
    marginTop: 4,
  },
  subText: {
    fontSize: 12,
    color: COLORS.gray[400],
    marginTop: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfCard: {
    width: "48%",
  },
  smallValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.gray[900],
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.gray[900],
    marginTop: 10,
    marginBottom: 16,
  },
  occupancyRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.gray[900],
    textAlign: "center",
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray[400],
    marginTop: 4,
    textAlign: "center",
  },
});

export default OwnerDashboard;
