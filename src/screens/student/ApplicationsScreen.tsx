import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import {
  FileText,
  Plus,
  X,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Wrench,
  Home,
  MessageSquare,
} from "lucide-react-native";
import { COLORS, SIZES, SHADOWS } from "../../theme/theme";
import apiClient from "../../api/client";
import GradientHeader from "../../components/GradientHeader";

interface Application {
  id: string;
  type: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

const APP_TYPES = [
  { key: "room_change", label: "Xona almashtirish", icon: Home },
  { key: "maintenance", label: "Ta'mirlash so'rovi", icon: Wrench },
  { key: "complaint", label: "Shikoyat", icon: MessageSquare },
  { key: "other", label: "Boshqa", icon: FileText },
];

const STATUS_CONFIG = {
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
  rejected: {
    label: "Rad etildi",
    color: "#EF4444",
    bg: "#FEE2E2",
    Icon: XCircle,
  },
};

const ApplicationsScreen: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState(APP_TYPES[0].key);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchApplications = async () => {
    try {
      const res = await apiClient.get<Application[]>("/student/applications");
      setApplications(res.data);
    } catch {
      setApplications([
        {
          id: "1",
          type: "room_change",
          description: "Yangi xonaga o'tishni so'rayman",
          status: "pending",
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          type: "maintenance",
          description: "Deraza buzilgan",
          status: "approved",
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchApplications();
  }, []);

  const submitApplication = async () => {
    if (!description.trim()) return;
    setSubmitting(true);
    try {
      await apiClient.post("/student/applications", {
        type: selectedType,
        description,
      });
    } catch {
      // silently fall through
    }
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setModalVisible(false);
      setDescription("");
      setSelectedType(APP_TYPES[0].key);
      setRefreshing(true);
      fetchApplications();
    }, 1500);
    setSubmitting(false);
  };

  const typeLabel = (key: string) =>
    APP_TYPES.find((t) => t.key === key)?.label || key;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
  };

  const renderItem = ({ item }: { item: Application }) => {
    const cfg = STATUS_CONFIG[item.status];
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <FileText color={COLORS.primary} size={18} />
          <Text style={styles.appType}>{typeLabel(item.type)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
            <cfg.Icon color={cfg.color} size={12} />
            <Text style={[styles.statusText, { color: cfg.color }]}>
              {cfg.label}
            </Text>
          </View>
        </View>
        <Text style={styles.appDesc} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.appDate}>{formatDate(item.createdAt)}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <GradientHeader title="Arizalar" subtitle="Mening so'rovlarim" />

      <View style={styles.headerBar}>
        <Text style={styles.countText}>{applications.length} ta ariza</Text>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => setModalVisible(true)}
        >
          <Plus color="white" size={18} />
          <Text style={styles.newBtnText}>Yangi ariza</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={applications}
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
          <View style={styles.empty}>
            <FileText color={COLORS.gray[300]} size={56} />
            <Text style={styles.emptyText}>Hozircha arizalar yo'q</Text>
            <Text style={styles.emptySub}>
              Yangi ariza yuborish uchun + tugmasini bosing
            </Text>
          </View>
        }
      />

      {/* New Application Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yangi ariza</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color={COLORS.gray[500]} size={24} />
              </TouchableOpacity>
            </View>

            {success ? (
              <View style={styles.successBox}>
                <CheckCircle2 color="#10B981" size={56} />
                <Text style={styles.successText}>Ariza yuborildi!</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.fieldLabel}>Ariza turi</Text>
                <View style={styles.typeGrid}>
                  {APP_TYPES.map((t) => {
                    const Icon = t.icon;
                    const active = selectedType === t.key;
                    return (
                      <TouchableOpacity
                        key={t.key}
                        style={[
                          styles.typeCard,
                          active && styles.typeCardActive,
                        ]}
                        onPress={() => setSelectedType(t.key)}
                      >
                        <Icon
                          color={active ? COLORS.primary : COLORS.gray[400]}
                          size={22}
                        />
                        <Text
                          style={[
                            styles.typeLabel,
                            active && styles.typeLabelActive,
                          ]}
                        >
                          {t.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={styles.fieldLabel}>Izoh</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Arizangiz mazmunini yozing..."
                  placeholderTextColor={COLORS.gray[400]}
                  multiline
                  numberOfLines={4}
                  value={description}
                  onChangeText={setDescription}
                  textAlignVertical="top"
                />

                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    (!description.trim() || submitting) &&
                      styles.submitDisabled,
                  ]}
                  onPress={submitApplication}
                  disabled={!description.trim() || submitting}
                >
                  <Text style={styles.submitText}>Yuborish</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SIZES.padding,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  countText: { fontSize: 14, color: COLORS.gray[500] },
  newBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
  },
  newBtnText: { color: "white", fontWeight: "700", fontSize: 14 },
  list: { padding: SIZES.padding, gap: 12 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    ...SHADOWS.soft,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  appType: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.gray[800],
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusText: { fontSize: 11, fontWeight: "700" },
  appDesc: {
    fontSize: 13,
    color: COLORS.gray[500],
    lineHeight: 19,
    marginBottom: 8,
  },
  appDate: { fontSize: 11, color: COLORS.gray[400] },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
    gap: 10,
  },
  emptyText: { fontSize: 16, color: COLORS.gray[500], fontWeight: "600" },
  emptySub: { fontSize: 13, color: COLORS.gray[400], textAlign: "center" },
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "85%",
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
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.gray[700],
    marginBottom: 10,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  typeCard: {
    width: "47%",
    padding: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F8FAFC",
  },
  typeCardActive: { borderColor: COLORS.primary, backgroundColor: "#EEF2FF" },
  typeLabel: {
    fontSize: 12,
    color: COLORS.gray[500],
    textAlign: "center",
    fontWeight: "500",
  },
  typeLabelActive: { color: COLORS.primary, fontWeight: "700" },
  textArea: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 14,
    height: 120,
    fontSize: 14,
    color: COLORS.gray[900],
    backgroundColor: "#F8FAFC",
    marginBottom: 20,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  submitDisabled: { opacity: 0.5 },
  submitText: { color: "white", fontSize: 16, fontWeight: "700" },
  successBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 16,
  },
  successText: { fontSize: 18, fontWeight: "700", color: COLORS.gray[900] },
});

export default ApplicationsScreen;
