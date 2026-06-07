import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  Bed,
  Users,
  Info,
  ShieldCheck,
  List,
  ChevronLeft,
} from "lucide-react-native";
import { COLORS, SIZES, SHADOWS } from "../../theme/theme";
import GradientHeader from "../../components/GradientHeader";
import DashboardCard from "../../components/DashboardCard";
import { useNavigation } from "@react-navigation/native";

const RoomDetailsScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <GradientHeader
        title="Xona Tafsilotlari"
        subtitle="301-xona"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <DashboardCard
          title="Umumiy ma'lumot"
          icon={<Info color={COLORS.primary} size={20} />}
        >
          <View style={styles.mainInfoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Xona turi</Text>
              <Text style={styles.infoValue}>Standart</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Qavat</Text>
              <Text style={styles.infoValue}>3-qavat</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Yotoqlar</Text>
              <Text style={styles.infoValue}>2 kishilik</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Narxi</Text>
              <Text style={styles.infoValue}>500 000 so'm</Text>
            </View>
          </View>
        </DashboardCard>

        <Text style={styles.sectionTitle}>Xonadoshlar</Text>

        <DashboardCard style={styles.roommateCard}>
          <View style={styles.roommateRow}>
            <View style={styles.avatarMini}>
              <Text style={styles.avatarMiniText}>AB</Text>
            </View>
            <View style={styles.roommateInfo}>
              <Text style={styles.roommateName}>Abror Bakirov</Text>
              <Text style={styles.roommateStatus}>Aktiv</Text>
            </View>
            <TouchableOpacity style={styles.chatButton}>
              <Text style={styles.chatButtonText}>Chat</Text>
            </TouchableOpacity>
          </View>
        </DashboardCard>

        <Text style={styles.sectionTitle}>Jihozlar ro'yxati</Text>

        <DashboardCard icon={<List color={COLORS.primary} size={20} />}>
          <View style={styles.listItem}>
            <Bed color={COLORS.gray[400]} size={16} />
            <Text style={styles.listItemText}>Yotoq (2 dona)</Text>
          </View>
          <View style={styles.listItem}>
            <List color={COLORS.gray[400]} size={16} />
            <Text style={styles.listItemText}>Shkaf (1 dona)</Text>
          </View>
          <View style={styles.listItem}>
            <List color={COLORS.gray[400]} size={16} />
            <Text style={styles.listItemText}>Stol va stul (1 dona)</Text>
          </View>
        </DashboardCard>

        <Text style={styles.sectionTitle}>Yashash qoidalari</Text>

        <DashboardCard icon={<ShieldCheck color="#10B981" size={20} />}>
          <Text style={styles.rulesText}>
            1. Kechki soat 23:00 dan keyin shovqin qilish taqiqlanadi.{"\n"}
            2. Xonada tozalikka rioya qiling.{"\n"}
            3. Begona shaxslarni olib kirish qat'iyan man etiladi.
          </Text>
          <TouchableOpacity style={styles.fullRulesLink}>
            <Text style={styles.fullRulesText}>Barcha qoidalarni o'qish</Text>
          </TouchableOpacity>
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
  mainInfoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  infoItem: {
    width: "50%",
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.gray[400],
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.gray[900],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.gray[900],
    marginBottom: 16,
    marginTop: 10,
  },
  roommateCard: {
    paddingVertical: 12,
  },
  roommateRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarMini: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarMiniText: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  roommateInfo: {
    flex: 1,
    marginLeft: 12,
  },
  roommateName: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.gray[900],
  },
  roommateStatus: {
    fontSize: 12,
    color: "#10B981",
    marginTop: 2,
  },
  chatButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#EEF2FF",
  },
  chatButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primary,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  listItemText: {
    fontSize: 14,
    color: COLORS.gray[700],
  },
  rulesText: {
    fontSize: 14,
    color: COLORS.gray[600],
    lineHeight: 22,
  },
  fullRulesLink: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 12,
  },
  fullRulesText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },
});

export default RoomDetailsScreen;
