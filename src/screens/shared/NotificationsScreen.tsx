import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import {
  Bell,
  BellOff,
  Check,
  Info,
  AlertTriangle,
  CreditCard,
} from "lucide-react-native";
import { COLORS, SIZES, SHADOWS } from "../../theme/theme";
import apiClient from "../../api/client";
import GradientHeader from "../../components/GradientHeader";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "payment" | "system";
  isRead: boolean;
  createdAt: string;
}

const NotificationsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await apiClient.get<Notification[]>("/notifications");
      setNotifications(res.data);
    } catch {
      // Fallback mock data
      setNotifications([
        {
          id: "1",
          title: "To'lov eslatmasi",
          message:
            "Mart oyi uchun to'lov muddati yaqinlashmoqda. 1-aprelgacha to'lang.",
          type: "payment",
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          title: "Xonadosh o'zgardi",
          message: "Sizning xonangizga yangi xonadosh joylashtirildi.",
          type: "info",
          isRead: false,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "3",
          title: "Ariza tasdiqlandi",
          message: "Xizmat ko'rsatish arizangiz tasdiqlandi.",
          type: "system",
          isRead: true,
          createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "payment":
        return <CreditCard color="#6366F1" size={20} />;
      case "warning":
        return <AlertTriangle color="#F59E0B" size={20} />;
      default:
        return <Info color="#3B82F6" size={20} />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case "payment":
        return "#EEF2FF";
      case "warning":
        return "#FEF3C7";
      default:
        return "#EFF6FF";
    }
  };

  const formatDate = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "Hozir";
    if (hours < 24) return `${hours} soat oldin`;
    return `${Math.floor(hours / 24)} kun oldin`;
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity onPress={() => markAsRead(item.id)} activeOpacity={0.7}>
      <View style={[styles.notifCard, !item.isRead && styles.unreadCard]}>
        {!item.isRead && <View style={styles.unreadDot} />}
        <View
          style={[styles.iconBox, { backgroundColor: getIconBg(item.type) }]}
        >
          {getIcon(item.type)}
        </View>
        <View style={styles.textArea}>
          <Text style={[styles.notifTitle, !item.isRead && styles.boldTitle]}>
            {item.title}
          </Text>
          <Text style={styles.notifMessage} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={styles.notifDate}>{formatDate(item.createdAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <GradientHeader
        title="Bildirishnomalar"
        subtitle={`${unreadCount} yangi`}
      />

      <View style={styles.actionsBar}>
        <Text style={styles.totalText}>
          {notifications.length} ta bildirishnoma
        </Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead} style={styles.markAllBtn}>
            <Check color={COLORS.primary} size={16} />
            <Text style={styles.markAllText}>Barchasini o'qildi</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.center}>
          <BellOff color={COLORS.gray[300]} size={64} />
          <Text style={styles.emptyText}>Bildirishnomalar yo'q</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
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
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  actionsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  totalText: { fontSize: 13, color: COLORS.gray[500] },
  markAllBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  markAllText: { fontSize: 13, color: COLORS.primary, fontWeight: "600" },
  list: { padding: SIZES.padding, gap: 12 },
  notifCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    ...SHADOWS.soft,
    position: "relative",
  },
  unreadCard: { borderLeftWidth: 3, borderLeftColor: COLORS.primary },
  unreadDot: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  textArea: { flex: 1 },
  notifTitle: { fontSize: 14, color: COLORS.gray[700], marginBottom: 4 },
  boldTitle: { fontWeight: "700", color: COLORS.gray[900] },
  notifMessage: { fontSize: 13, color: COLORS.gray[500], lineHeight: 19 },
  notifDate: { fontSize: 11, color: COLORS.gray[400], marginTop: 6 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyText: { fontSize: 16, color: COLORS.gray[400] },
});

export default NotificationsScreen;
