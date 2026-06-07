import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Moon, Menu, ChevronLeft } from "lucide-react-native";
import { COLORS, SIZES, SHADOWS } from "../theme/theme";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useDorms } from "../context/DormContext";
import { useNavigation } from "@react-navigation/native";

interface GradientHeaderProps {
  title: string;
  subtitle?: string;
  showMenu?: boolean;
  showBack?: boolean;
  onBack?: () => void;
}

export default function GradientHeader({
  title,
  subtitle,
  showMenu = true,
  showBack,
  onBack,
}: GradientHeaderProps) {
  const { user } = useAuth();
  const { theme, toggleTheme, isDarkMode } = useTheme();
  const { dorms, selectedDorm, switchDorm } = useDorms();
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = React.useState(false);
  const navigation = useNavigation();

  const handleSwitch = async (id: string) => {
    await switchDorm(id);
    setModalVisible(false);
  };

  const canGoBack = navigation.canGoBack();
  const shouldShowBack = showBack !== undefined ? showBack : canGoBack;
  const handleBack = onBack || (() => {
    if (canGoBack) {
      navigation.goBack();
    }
  });

  return (
    <LinearGradient
      colors={[COLORS.gradient.start, COLORS.gradient.end]}
      style={[styles.container, { paddingTop: insets.top + 10 }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        <View style={styles.topRow}>
          {shouldShowBack ? (
            <TouchableOpacity style={styles.iconButton} onPress={handleBack}>
              <ChevronLeft color="white" size={24} />
            </TouchableOpacity>
          ) : (
            showMenu &&
            user?.role === "manager" && (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setModalVisible(true)}
              >
                <Menu color="white" size={24} />
              </TouchableOpacity>
            )
          )}
          <View style={styles.rightIcons}>
            <TouchableOpacity style={styles.iconButton} onPress={toggleTheme}>
              <Moon
                color="white"
                size={24}
                fill={isDarkMode ? "white" : "transparent"}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.titleContainer}>
          {subtitle || selectedDorm ? (
            <Text style={styles.subtitle}>
              {subtitle || selectedDorm?.name}
            </Text>
          ) : null}
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Binoni tanlang
            </Text>
            <FlatList
              data={dorms}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.dormItem,
                    selectedDorm?._id === item._id && {
                      backgroundColor: COLORS.primary + "15",
                    },
                  ]}
                  onPress={() => handleSwitch(item._id)}
                >
                  <Text
                    style={[
                      styles.dormName,
                      { color: theme.text },
                      selectedDorm?._id === item._id && {
                        color: COLORS.primary,
                        fontWeight: "700",
                      },
                    ]}
                  >
                    {item.name}
                  </Text>
                  {item.address && (
                    <Text
                      style={[
                        styles.dormAddress,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {item.address}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  content: {
    paddingHorizontal: SIZES.padding,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  rightIcons: {
    flexDirection: "row",
    gap: 15,
    marginLeft: "auto",
  },
  iconButton: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
  },
  titleContainer: {
    marginTop: 4,
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  title: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxHeight: "70%",
    borderRadius: 24,
    padding: 20,
    ...SHADOWS.medium,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  dormItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  dormName: {
    fontSize: 16,
    fontWeight: "600",
  },
  dormAddress: {
    fontSize: 13,
    marginTop: 2,
  },
});
