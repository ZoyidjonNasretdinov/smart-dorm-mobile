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
} from "react-native";
import {
  Search,
  Users,
  Phone,
  BedDouble,
  CreditCard,
} from "lucide-react-native";
import { COLORS, SIZES, SHADOWS } from "../../theme/theme";
import { useTheme } from "../../context/ThemeContext";
import apiClient from "../../api/client";
import { useNavigation } from "@react-navigation/native";
import { useDorms } from "../../context/DormContext";
import GradientHeader from "../../components/GradientHeader";

interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  room?: string;
  paymentStatus?: "paid" | "pending" | "overdue";
}

const PAY_CONFIG = {
  paid: { label: "To'langan", color: "#10B981", bg: "#D1FAE5" },
  pending: { label: "Kutilmoqda", color: "#F59E0B", bg: "#FEF3C7" },
  overdue: { label: "Muddati o'tgan", color: "#EF4444", bg: "#FEE2E2" },
};

const StudentsListScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme, isDarkMode } = useTheme();
  const { selectedDorm } = useDorms();
  const [students, setStudents] = useState<Student[]>([]);
  const [filtered, setFiltered] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const fetchStudents = async () => {
    try {
      const dId = selectedDorm?._id;
      const res = await apiClient.get<Student[]>(
        `/manager/students${dId ? `?dormId=${dId}` : ""}`,
      );
      setStudents(res.data);
      setFiltered(res.data);
    } catch {
      const mock: Student[] = [
        {
          id: "1",
          name: "Sardor Rahimov",
          email: "sardor@email.com",
          phone: "+998 90 123 4567",
          room: "301",
          paymentStatus: "paid",
        },
        {
          id: "2",
          name: "Aziza Normatova",
          email: "aziza@email.com",
          phone: "+998 91 234 5678",
          room: "204",
          paymentStatus: "pending",
        },
        {
          id: "3",
          name: "Bobur Toshmatov",
          email: "bobur@email.com",
          phone: "+998 93 345 6789",
          room: "115",
          paymentStatus: "overdue",
        },
        {
          id: "4",
          name: "Dilnoza Yusupova",
          email: "dilnoza@email.com",
          phone: "+998 94 456 7890",
          room: "302",
          paymentStatus: "paid",
        },
        {
          id: "5",
          name: "Jasur Mirzaev",
          email: "jasur@email.com",
          phone: "+998 97 567 8901",
          room: "201",
          paymentStatus: "paid",
        },
      ];
      setStudents(mock);
      setFiltered(mock);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedDorm]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStudents().finally(() => setRefreshing(false));
  }, [selectedDorm]);

  useEffect(() => {
    const q = search.toLowerCase().trim();
    if (!q) {
      setFiltered(students);
    } else {
      const cleanQ = q.replace(/[^0-9a-zA-Z]/g, "");
      setFiltered(
        students.filter((s) => {
          const nameMatch = s.name ? s.name.toLowerCase().includes(q) : false;
          
          const roomStr = s.room ? s.room.toString().toLowerCase() : "";
          const roomMatch = roomStr.includes(q);
          
          const phoneStr = s.phone ? s.phone.toString().replace(/[^0-9a-zA-Z]/g, "") : "";
          const phoneMatch = s.phone 
            ? s.phone.toString().toLowerCase().includes(q) || phoneStr.includes(cleanQ) 
            : false;
          
          return nameMatch || roomMatch || phoneMatch;
        }),
      );
    }
  }, [search, students]);

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const AVATAR_COLORS = [
    "#6366F1",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#3B82F6",
    "#EC4899",
  ];

  const renderItem = ({ item, index }: { item: Student; index: number }) => {
    const pay = item.paymentStatus ? PAY_CONFIG[item.paymentStatus] : null;
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.card }]}
        onPress={() =>
          (navigation.navigate as any)("StudentDetail", { studentId: item.id })
        }
      >
        <View
          style={[
            styles.avatar,
            { backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] },
          ]}
        >
          <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
        </View>
        <View style={styles.info}>
          <Text style={[styles.studentName, { color: theme.text }]}>
            {item.name}
          </Text>
          <View style={styles.metaRow}>
            {item.room && (
              <View style={styles.metaItem}>
                <BedDouble color={theme.textSecondary} size={13} />
                <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                  {item.room}-xona
                </Text>
              </View>
            )}
            {item.phone && (
              <View style={styles.metaItem}>
                <Phone color={theme.textSecondary} size={13} />
                <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                  {item.phone}
                </Text>
              </View>
            )}
          </View>
        </View>
        {pay && (
          <View
            style={[
              styles.payBadge,
              { backgroundColor: isDarkMode ? pay.color + "20" : pay.bg },
            ]}
          >
            <Text style={[styles.payText, { color: pay.color }]}>
              {pay.label}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title="Talabalar" subtitle={`${students.length} nafar`} />

      <View style={[styles.searchBar, { backgroundColor: theme.card }]}>
        <Search color={theme.textSecondary} size={18} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Ism, xona yoki telefon..."
          placeholderTextColor={theme.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Users color={COLORS.gray[300]} size={56} />
              <Text style={styles.emptyText}>Talaba topilmadi</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.padding,
    marginTop: 10,
    marginBottom: 4,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    ...SHADOWS.soft,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.gray[900] },
  list: { padding: SIZES.padding, gap: 10 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    ...SHADOWS.soft,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: { color: "white", fontWeight: "700", fontSize: 16 },
  info: { flex: 1 },
  studentName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.gray[900],
    marginBottom: 4,
  },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, color: COLORS.gray[500] },
  payBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "center",
  },
  payText: { fontSize: 11, fontWeight: "700" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
    gap: 10,
  },
  emptyText: { fontSize: 15, color: COLORS.gray[400] },
});

export default StudentsListScreen;
