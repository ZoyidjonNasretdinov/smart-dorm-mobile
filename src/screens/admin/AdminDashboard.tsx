import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Users, Building, GraduationCap, Briefcase } from "lucide-react-native";
import { COLORS, SIZES } from "../../theme/theme";
import apiClient from "../../api/client";
import GradientHeader from "../../components/GradientHeader";
import DashboardCard from "../../components/DashboardCard";

interface AdminStats {
  totalOwners: number;
  totalManagers: number;
  totalStudents: number;
  totalDorms: number;
  totalRooms: number;
}

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);

  const fetchStats = async () => {
    try {
      const response = await apiClient.get<AdminStats>("/admin/dashboard");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <View style={styles.container}>
      <GradientHeader title="Dashboard" subtitle="Administrator" />

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
        <View style={styles.statsGrid}>
          <DashboardCard
            title="Jami Egalar"
            style={styles.statCard}
            icon={<Briefcase color="#6366F1" size={20} />}
          >
            <Text style={styles.statValue}>{stats?.totalOwners || 0}</Text>
            <Text style={styles.statLabel}>Aktiv bino egalari</Text>
          </DashboardCard>

          <DashboardCard
            title="Menejerlar"
            style={styles.statCard}
            icon={<Users color="#EC4899" size={20} />}
          >
            <Text style={styles.statValue}>{stats?.totalManagers || 0}</Text>
            <Text style={styles.statLabel}>Tizim boshqaruvchilari</Text>
          </DashboardCard>

          <DashboardCard
            title="Talabalar"
            style={styles.statCard}
            icon={<GraduationCap color="#10B981" size={20} />}
          >
            <Text style={styles.statValue}>{stats?.totalStudents || 0}</Text>
            <Text style={styles.statLabel}>Jami talabalar soni</Text>
          </DashboardCard>

          <DashboardCard
            title="Binolar"
            style={styles.statCard}
            icon={<Building color="#F59E0B" size={20} />}
          >
            <Text style={styles.statValue}>{stats?.totalDorms || 0}</Text>
            <Text style={styles.statLabel}>Ro'yxatga olingan</Text>
          </DashboardCard>
        </View>

        <Text style={styles.sectionTitle}>Tizim o'sishi</Text>
        <DashboardCard title="Foydalanuvchilar (Oxirgi 6 oy)">
          <View style={styles.placeholderChart}>
            <Text style={styles.placeholderText}>
              Grafik ma'lumotlari yuklanmoqda...
            </Text>
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.gray[900],
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray[400],
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.gray[900],
    marginTop: 10,
    marginBottom: 16,
  },
  placeholderChart: {
    height: 150,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORS.gray[200],
  },
  placeholderText: {
    color: COLORS.gray[400],
    fontSize: 12,
  },
});

export default AdminDashboard;
