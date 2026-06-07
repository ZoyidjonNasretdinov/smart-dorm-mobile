import React from "react";
import { StyleSheet, View, Text, ViewStyle, StyleProp } from "react-native";
import { COLORS, SIZES, SHADOWS } from "../theme/theme";
import { ChevronRight } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";

interface DashboardCardProps {
  children: React.ReactNode;
  title?: string;
  badge?: string;
  badgeType?: "success" | "warning" | "danger" | "info";
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
  showArrow?: boolean;
}

export default function DashboardCard({
  children,
  title,
  badge,
  badgeType = "info",
  style,
  icon,
  showArrow = false,
}: DashboardCardProps) {
  const { theme, isDarkMode } = useTheme();

  const getBadgeColor = () => {
    switch (badgeType) {
      case "success":
        return isDarkMode ? "#064e3b" : "#DCFCE7";
      case "warning":
        return isDarkMode ? "#451a03" : "#FEF3C7";
      case "danger":
        return isDarkMode ? "#450a0a" : "#FEE2E2";
      default:
        return isDarkMode ? "#1e1b4b" : "#E0E7FF";
    }
  };

  const getBadgeTextColor = () => {
    switch (badgeType) {
      case "success":
        return isDarkMode ? "#34d399" : "#166534";
      case "warning":
        return isDarkMode ? "#fbbf24" : "#92400E";
      case "danger":
        return isDarkMode ? "#f87171" : "#991B1B";
      default:
        return isDarkMode ? "#818cf8" : "#3730A3";
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.card }, style]}>
      {(title || badge || icon) && (
        <View style={styles.header}>
          <View style={styles.titleRow}>
            {icon && (
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: isDarkMode ? "#334155" : "#F1F5F9" },
                ]}
              >
                {icon}
              </View>
            )}
            {title && (
              <Text style={[styles.title, { color: theme.textSecondary }]}>
                {title}
              </Text>
            )}
          </View>
          {badge && (
            <View style={[styles.badge, { backgroundColor: getBadgeColor() }]}>
              <Text style={[styles.badgeText, { color: getBadgeTextColor() }]}>
                {badge}
              </Text>
            </View>
          )}
        </View>
      )}
      <View style={styles.content}>{children}</View>
      {showArrow && (
        <View style={styles.arrowContainer}>
          <ChevronRight
            color={isDarkMode ? COLORS.gray[600] : COLORS.gray[300]}
            size={20}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 20,
    marginBottom: 16,
    ...SHADOWS.medium,
    position: "relative",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 14,
    color: COLORS.gray[500],
    fontWeight: "500",
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  content: {
    marginTop: 4,
  },
  arrowContainer: {
    position: "absolute",
    right: 20,
    top: "50%",
    marginTop: -10, // approximate halfway of arrow icon
  },
});
