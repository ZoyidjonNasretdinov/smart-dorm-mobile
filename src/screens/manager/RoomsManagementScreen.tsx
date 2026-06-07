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
  BedDouble,
  Plus,
  X,
  Users,
  ChevronDown,
  UserMinus,
  UserPlus,
  Layers,
} from "lucide-react-native";
import { COLORS, SIZES, SHADOWS } from "../../theme/theme";
import { useTheme } from "../../context/ThemeContext";
import apiClient from "../../api/client";
import GradientHeader from "../../components/GradientHeader";
import { useDorms } from "../../context/DormContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface RoomStudent {
  _id: string;
  name: string;
  phone?: string;
}

interface Room {
  _id: string;
  roomNumber: string;
  floor: number;
  capacity: number;
  type: string;
  status: "available" | "occupied" | "maintenance";
  studentIds: RoomStudent[];
}

interface Student {
  _id: string;
  name: string;
  phone?: string;
}

const STATUS_CONFIG = {
  available: { label: "Bo'sh", color: "#10B981", bg: "#D1FAE5" },
  occupied: { label: "To'lgan", color: "#EF4444", bg: "#FEE2E2" },
  maintenance: { label: "Ta'mirda", color: "#F59E0B", bg: "#FEF3C7" },
};

const ROOM_TYPES = ["standard", "double", "suite"];

export default function RoomsManagementScreen() {
  const { theme, isDarkMode } = useTheme();
  const { selectedDorm } = useDorms();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Create Room Modal
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newRoom, setNewRoom] = useState({
    roomNumber: "",
    floor: "1",
    capacity: "2",
    type: "standard",
    price: "1000000",
  });

  // Assign Student Modal
  const [assignModal, setAssignModal] = useState<{
    visible: boolean;
    room: Room | null;
  }>({ visible: false, room: null });
  const [assigning, setAssigning] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentDropOpen, setStudentDropOpen] = useState(false);

  useEffect(() => {
    fetchRooms(selectedDorm?._id);
    fetchStudents();
  }, [selectedDorm]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRooms(selectedDorm?._id).finally(() => setRefreshing(false));
    fetchStudents();
  }, [selectedDorm]);

  const fetchRooms = async (dId?: string) => {
    try {
      const url = dId ? `/rooms?dormId=${dId}` : `/rooms`;
      const res = await apiClient.get<Room[]>(url);
      setRooms(res.data);
    } catch {
      setRooms([
        {
          _id: "1",
          roomNumber: "101",
          floor: 1,
          capacity: 3,
          type: "standard",
          status: "occupied",
          studentIds: [
            { _id: "s1", name: "Sardor Rahimov", phone: "+998901234567" },
            { _id: "s2", name: "Bobur Toshmatov" },
          ],
        },
        {
          _id: "2",
          roomNumber: "102",
          floor: 1,
          capacity: 2,
          type: "double",
          status: "available",
          studentIds: [],
        },
        {
          _id: "3",
          roomNumber: "201",
          floor: 2,
          capacity: 4,
          type: "suite",
          status: "occupied",
          studentIds: [{ _id: "s3", name: "Aziza Normatova" }],
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await apiClient.get<Student[]>("/manager/students");
      setStudents(res.data);
    } catch {
      setStudents([
        { _id: "s10", name: "Nodira Karimova", phone: "+998907654321" },
        { _id: "s11", name: "Jasur Mirzaev", phone: "+998912345678" },
        { _id: "s12", name: "Dilnoza Yusupova" },
      ]);
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoom.roomNumber.trim()) {
      Alert.alert("Xato", "Xona raqamini kiriting");
      return;
    }
    setCreating(true);
    try {
      const res = await apiClient.post<Room>("/rooms", {
        dormId: selectedDorm?._id,
        roomNumber: newRoom.roomNumber.trim(),
        floor: parseInt(newRoom.floor) || 1,
        capacity: parseInt(newRoom.capacity) || 2,
        type: newRoom.type,
        price: parseInt(newRoom.price) || 0,
      });
      setRooms((prev) => [...prev, res.data]);
      setShowCreate(false);
      setNewRoom({
        roomNumber: "",
        floor: "1",
        capacity: "2",
        type: "standard",
        price: "1000000",
      });
    } catch (e: any) {
      Alert.alert(
        "Xato",
        e.response?.data?.message || "Xona yaratishda xatolik",
      );
    } finally {
      setCreating(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedStudent || !assignModal.room) return;
    setAssigning(true);
    try {
      await apiClient.post(
        `/rooms/${assignModal.room._id}/assign/${selectedStudent._id}`,
      );
      await fetchRooms(selectedDorm?._id || "");
      setAssignModal({ visible: false, room: null });
      setSelectedStudent(null);
    } catch (e: any) {
      Alert.alert("Xato", e.response?.data?.message || "Biriktirish xatoligi");
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveStudent = (room: Room, student: RoomStudent) => {
    Alert.alert(
      "Tasdiqlang",
      `${student.name}ni ${room.roomNumber}-xonadan chiqarilsinmi?`,
      [
        { text: "Bekor", style: "cancel" },
        {
          text: "Chiqarish",
          style: "destructive",
          onPress: async () => {
            try {
              await apiClient.delete(
                `/rooms/${room._id}/remove/${student._id}`,
              );
              fetchRooms(selectedDorm?._id || "");
            } catch {
              Alert.alert("Xato", "Chiqarishda xatolik yuz berdi");
            }
          },
        },
      ],
    );
  };

  const renderRoom = ({ item }: { item: Room }) => {
    const st = STATUS_CONFIG[item.status] || STATUS_CONFIG.available;
    const freeSlots = item.capacity - item.studentIds.length;

    return (
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <View style={styles.cardHeader}>
          <View style={styles.roomNumBox}>
            <BedDouble color={COLORS.primary} size={18} />
            <Text style={[styles.roomNum, { color: theme.text }]}>
              {item.roomNumber}-xona
            </Text>
          </View>
          <View
            style={[
              styles.badge,
              { backgroundColor: isDarkMode ? st.color + "20" : st.bg },
            ]}
          >
            <Text style={[styles.badgeText, { color: st.color }]}>
              {st.label}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <MetaChip
            icon={<Layers color={theme.textSecondary} size={12} />}
            text={`${item.floor}-qavat`}
          />
          <MetaChip
            icon={<Users color={theme.textSecondary} size={12} />}
            text={`${item.studentIds.length}/${item.capacity}`}
          />
          <MetaChip icon={null} text={item.type} />
        </View>

        {/* Students in room */}
        {item.studentIds.length > 0 && (
          <View style={styles.studentsList}>
            {item.studentIds.map((s) => (
              <View
                key={s._id}
                style={[
                  styles.studentRow,
                  { backgroundColor: isDarkMode ? "#1e293b" : COLORS.gray[50] },
                ]}
              >
                <View style={styles.studentAvatar}>
                  <Text style={styles.studentAvatarText}>
                    {s.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text
                  style={[styles.studentName, { color: theme.text }]}
                  numberOfLines={1}
                >
                  {s.name}
                </Text>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => handleRemoveStudent(item, s)}
                >
                  <UserMinus color="#EF4444" size={15} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Assign button */}
        {freeSlots > 0 && (
          <TouchableOpacity
            style={styles.assignBtn}
            onPress={() => {
              setSelectedStudent(null);
              setAssignModal({ visible: true, room: item });
            }}
          >
            <UserPlus color={COLORS.primary} size={15} />
            <Text style={styles.assignBtnText}>
              Talaba biriktirish ({freeSlots} joy bor)
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GradientHeader title="Xonalar" subtitle={`${rooms.length} ta xona`} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(r) => r._id}
          renderItem={renderRoom}
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
              <BedDouble color={COLORS.gray[300]} size={56} />
              <Text style={styles.emptyText}>Xona topilmadi</Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowCreate(true)}>
        <Plus color="white" size={24} />
      </TouchableOpacity>

      {/* ── Create Room Modal ── */}
      <Modal visible={showCreate} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={[styles.modalSheet, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Yangi xona
              </Text>
              <TouchableOpacity onPress={() => setShowCreate(false)}>
                <X color={theme.textSecondary} size={22} />
              </TouchableOpacity>
            </View>

            <FieldInput
              label="Xona raqami *"
              value={newRoom.roomNumber}
              onChangeText={(v) => setNewRoom((p) => ({ ...p, roomNumber: v }))}
              placeholder="masalan: 101"
              keyboardType="numeric"
            />
            <FieldInput
              label="Qavat"
              value={newRoom.floor}
              onChangeText={(v) => setNewRoom((p) => ({ ...p, floor: v }))}
              placeholder="1"
              keyboardType="numeric"
            />
            <FieldInput
              label="Sig'im (necha kishilik)"
              value={newRoom.capacity}
              onChangeText={(v) => setNewRoom((p) => ({ ...p, capacity: v }))}
              placeholder="2"
              keyboardType="numeric"
            />
            <FieldInput
              label="Narxi (oylik)"
              value={newRoom.price}
              onChangeText={(v) => setNewRoom((p) => ({ ...p, price: v }))}
              placeholder="masalan: 1000000"
              keyboardType="numeric"
            />

            <Text style={styles.fieldLabel}>Tur</Text>
            <View style={styles.typeRow}>
              {ROOM_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.typeChip,
                    newRoom.type === t && styles.typeChipActive,
                  ]}
                  onPress={() => setNewRoom((p) => ({ ...p, type: t }))}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      { color: theme.textSecondary },
                      newRoom.type === t && styles.typeChipTextActive,
                    ]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, creating && { opacity: 0.7 }]}
              onPress={handleCreateRoom}
              disabled={creating}
            >
              {creating ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.primaryBtnText}>Yaratish</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Assign Student Modal ── */}
      <Modal visible={assignModal.visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {assignModal.room?.roomNumber}-xona: talaba biriktirish
              </Text>
              <TouchableOpacity
                onPress={() => setAssignModal({ visible: false, room: null })}
              >
                <X color={theme.textSecondary} size={22} />
              </TouchableOpacity>
            </View>

            {/* Dropdown */}
            <Text style={styles.fieldLabel}>Talabani tanlang</Text>
            <TouchableOpacity
              style={[
                styles.dropdown,
                {
                  backgroundColor: isDarkMode ? "#1e293b" : "transparent",
                  borderColor: isDarkMode ? "#334155" : COLORS.gray[200],
                },
              ]}
              onPress={() => setStudentDropOpen((o) => !o)}
            >
              <Text
                style={[
                  styles.dropdownText,
                  { color: theme.text },
                  !selectedStudent && { color: theme.textSecondary },
                ]}
              >
                {selectedStudent ? selectedStudent.name : "Tanlang..."}
              </Text>
              <ChevronDown color={theme.textSecondary} size={16} />
            </TouchableOpacity>

            {studentDropOpen && (
              <ScrollView
                style={[
                  styles.dropdownList,
                  { borderColor: isDarkMode ? "#334155" : COLORS.gray[200] },
                ]}
                nestedScrollEnabled
              >
                {students
                  .filter(
                    (st) =>
                      !assignModal.room?.studentIds.some(
                        (s) => s._id === st._id,
                      ),
                  )
                  .map((st) => (
                    <TouchableOpacity
                      key={st._id}
                      style={[
                        styles.dropdownItem,
                        {
                          borderBottomColor: isDarkMode
                            ? "#334155"
                            : COLORS.gray[100],
                        },
                      ]}
                      onPress={() => {
                        setSelectedStudent(st);
                        setStudentDropOpen(false);
                      }}
                    >
                      <Text
                        style={[styles.dropdownItemText, { color: theme.text }]}
                      >
                        {st.name}
                      </Text>
                      {st.phone && (
                        <Text
                          style={[
                            styles.dropdownItemSub,
                            { color: theme.textSecondary },
                          ]}
                        >
                          {st.phone}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            )}

            <TouchableOpacity
              style={[
                styles.primaryBtn,
                (!selectedStudent || assigning) && { opacity: 0.5 },
              ]}
              onPress={handleAssign}
              disabled={!selectedStudent || assigning}
            >
              {assigning ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.primaryBtnText}>Biriktirish</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ── Helper Components ──────────────────────────────────────────────────────────
const MetaChip = ({ icon, text }: { icon: React.ReactNode; text: string }) => {
  const { theme, isDarkMode } = useTheme();
  return (
    <View
      style={[
        styles.metaChip,
        { backgroundColor: isDarkMode ? "#1e293b" : COLORS.gray[100] },
      ]}
    >
      {icon}
      <Text style={[styles.metaChipText, { color: theme.textSecondary }]}>
        {text}
      </Text>
    </View>
  );
};

const FieldInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: any;
}) => {
  const { theme, isDarkMode } = useTheme();
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
        {label}
      </Text>
      <TextInput
        style={[
          styles.fieldInput,
          {
            color: theme.text,
            borderColor: isDarkMode ? "#334155" : COLORS.gray[200],
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        keyboardType={keyboardType}
      />
    </View>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
    gap: 10,
  },
  emptyText: { fontSize: 15, color: COLORS.gray[400] },
  list: { padding: SIZES.padding, gap: 12 },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    ...SHADOWS.soft,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  roomNumBox: { flexDirection: "row", alignItems: "center", gap: 6 },
  roomNum: { fontSize: 16, fontWeight: "700", color: COLORS.gray[900] },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: "700" },

  metaRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.gray[100],
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  metaChipText: { fontSize: 11, color: COLORS.gray[600] },

  studentsList: { gap: 8, marginBottom: 10 },
  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.gray[50],
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  studentAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  studentAvatarText: { color: "white", fontSize: 13, fontWeight: "700" },
  studentName: { flex: 1, fontSize: 13, color: COLORS.gray[800] },
  removeBtn: { padding: 4 },

  assignBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  assignBtnText: { color: COLORS.primary, fontSize: 13, fontWeight: "600" },

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

  // Modal
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
  },
  typeRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  typeChip: {
    borderWidth: 1.5,
    borderColor: COLORS.gray[200],
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  typeChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "15",
  },
  typeChipText: { fontSize: 13, color: COLORS.gray[600] },
  typeChipTextActive: { color: COLORS.primary, fontWeight: "700" },

  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.gray[200],
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 4,
  },
  dropdownText: { fontSize: 15, color: COLORS.gray[900] },
  dropdownList: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderRadius: 12,
    marginBottom: 16,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  dropdownItemText: { fontSize: 14, color: COLORS.gray[900] },
  dropdownItemSub: { fontSize: 12, color: COLORS.gray[400], marginTop: 2 },

  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 8,
  },
  primaryBtnText: { color: "white", fontSize: 16, fontWeight: "700" },
});
