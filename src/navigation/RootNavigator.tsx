import React from "react";
import { View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../theme/theme";
import {
  Home,
  CreditCard,
  User,
  LayoutDashboard,
  Bell,
  FileText,
  Users,
  BedDouble,
  Receipt,
  MessageCircle,
  Star,
} from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";

// Auth & Splash
import SplashScreen from "../screens/SplashScreen";
import LoginScreen from "../screens/auth/LoginScreen";

// Role Dashboards
import StudentDashboard from "../screens/student/StudentDashboard";
import AdminDashboard from "../screens/admin/AdminDashboard";
import OwnerDashboard from "../screens/owner/OwnerDashboard";

// Manager Screens
import ManagerDashboard from "../screens/manager/ManagerDashboard";
import StudentsListScreen from "../screens/manager/StudentsListScreen";
import StudentDetailScreen from "../screens/manager/StudentDetailScreen";
import RoomsManagementScreen from "../screens/manager/RoomsManagementScreen";
import ExpensesScreen from "../screens/manager/ExpensesScreen";
import PendingPaymentsScreen from "../screens/manager/PendingPaymentsScreen";
import BroadcastScreen from "../screens/manager/BroadcastScreen";

// Shared Screens
import PaymentHistoryScreen from "../screens/shared/PaymentHistoryScreen";
import ProfileScreen from "../screens/shared/ProfileScreen";
import NotificationsScreen from "../screens/shared/NotificationsScreen";
import ChatListScreen from "../screens/shared/ChatListScreen";
import ChatRoomScreen from "../screens/shared/ChatRoomScreen";
import SubscriptionScreen from "../screens/manager/SubscriptionScreen";
import CardManagementScreen from "../screens/manager/CardManagementScreen";

// Student Sub-Screens
import RoomDetailsScreen from "../screens/student/RoomDetailsScreen";
import PaymentUploadScreen from "../screens/student/PaymentUploadScreen";
import ApplicationsScreen from "../screens/student/ApplicationsScreen";

// ─── Root Stack Type ──────────────────────────────────────────────────────────
export type RootStackParamList = {
  Login: undefined;
  AdminTabs: undefined;
  OwnerTabs: undefined;
  ManagerTabs: undefined;
  StudentTabs: undefined;
  Subscription: undefined;
  CardManagement: undefined;
};

const RootStack = createStackNavigator<RootStackParamList>();

// ─── Shared Tab Style (safe-area aware) ──────────────────────────────────────
const useTabBarStyle = () => {
  const insets = useSafeAreaInsets();
  const { theme, isDarkMode } = useTheme();
  const bottomPad = Math.max(insets.bottom, 8);
  return {
    backgroundColor: theme.card,
    borderTopWidth: 1,
    borderTopColor: isDarkMode ? "#1e293b" : "#EEF2F7",
    // height = icon+label area (50) + bottom safe area
    height: 50 + bottomPad,
    paddingBottom: bottomPad,
    paddingTop: 8,
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: isDarkMode ? 0.2 : 0.06,
    shadowRadius: 12,
  };
};

const TAB_LABEL_STYLE = {
  fontSize: 10,
  fontWeight: "600" as const,
  marginTop: 2,
};

// ─── Icon wrapper that shows an active dot ────────────────────────────────────
const TabIcon = (Icon: any, focused: boolean, color: string) => {
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Icon color={color} size={22} strokeWidth={focused ? 2.5 : 1.8} />
      {focused && (
        <View
          style={{
            position: "absolute",
            bottom: -6,
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: COLORS.primary,
          }}
        />
      )}
    </View>
  );
};

// ─── Student Stack ─────────────────────────────────────────────────────────────
const StudentStack = createStackNavigator();
const StudentHomeStack = () => (
  <StudentStack.Navigator screenOptions={{ headerShown: false }}>
    <StudentStack.Screen name="Dashboard" component={StudentDashboard} />
    <StudentStack.Screen name="RoomDetails" component={RoomDetailsScreen} />
    <StudentStack.Screen name="PaymentUpload" component={PaymentUploadScreen} />
    {/* <StudentStack.Screen name="ChatRoom" component={ChatRoomScreen} /> */}
  </StudentStack.Navigator>
);

// ─── Student Tabs ─────────────────────────────────────────────────────────────
const StudentTab = createBottomTabNavigator();
const StudentTabs = () => {
  const tabBarStyle = useTabBarStyle();
  return (
    <StudentTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray[400],
        tabBarStyle,
        tabBarLabelStyle: TAB_LABEL_STYLE,
      }}
    >
      <StudentTab.Screen
        name="HomeTab"
        component={StudentHomeStack}
        options={{
          tabBarLabel: "Asosiy",
          tabBarIcon: ({ focused, color }) => TabIcon(Home, focused, color),
        }}
      />
      <StudentTab.Screen
        name="PaymentsTab"
        component={PaymentHistoryScreen}
        options={{
          tabBarLabel: "To'lovlar",
          tabBarIcon: ({ focused, color }) =>
            TabIcon(CreditCard, focused, color),
        }}
      />
      <StudentTab.Screen
        name="ApplicationsTab"
        component={ApplicationsScreen}
        options={{
          tabBarLabel: "Arizalar",
          tabBarIcon: ({ focused, color }) => TabIcon(FileText, focused, color),
        }}
      />
      <StudentTab.Screen
        name="NotificationsTab"
        component={NotificationsScreen}
        options={{
          tabBarLabel: "Xabarlar",
          tabBarIcon: ({ focused, color }) => TabIcon(Bell, focused, color),
        }}
      />
      {/* <StudentTab.Screen
        name="ChatTab"
        component={ChatListScreen}
        options={{
          tabBarLabel: "Chat",
          tabBarIcon: ({ focused, color }) =>
            TabIcon(MessageCircle, focused, color),
        }}
      /> */}
      <StudentTab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profil",
          tabBarIcon: ({ focused, color }) => TabIcon(User, focused, color),
        }}
      />
    </StudentTab.Navigator>
  );
};

// ─── Manager Stack ─────────────────────────────────────────────────────────────
const ManagerStack = createStackNavigator();
const ManagerHomeStack = () => (
  <ManagerStack.Navigator screenOptions={{ headerShown: false }}>
    <ManagerStack.Screen name="ManagerHome" component={ManagerDashboard} />
    <ManagerStack.Screen name="StudentsList" component={StudentsListScreen} />
    <ManagerStack.Screen
      name="RoomsManagement"
      component={RoomsManagementScreen}
    />
    <ManagerStack.Screen name="Expenses" component={ExpensesScreen} />
    <ManagerStack.Screen
      name="PendingPayments"
      component={PendingPaymentsScreen}
    />
    {/* <ManagerStack.Screen name="ChatRoom" component={ChatRoomScreen} /> */}
    <ManagerStack.Screen name="Broadcast" component={BroadcastScreen} />
    <ManagerStack.Screen name="StudentDetail" component={StudentDetailScreen} />
    <ManagerStack.Screen name="PaymentHistory" component={PaymentHistoryScreen} />
  </ManagerStack.Navigator>
);

// ─── Manager Tabs ─────────────────────────────────────────────────────────────
const ManagerTab = createBottomTabNavigator();
const ManagerTabs = () => {
  const tabBarStyle = useTabBarStyle();
  return (
    <ManagerTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray[400],
        tabBarStyle,
        tabBarLabelStyle: TAB_LABEL_STYLE,
      }}
    >
      <ManagerTab.Screen
        name="ManageTab"
        component={ManagerHomeStack}
        options={{
          tabBarLabel: "Boshqaruv",
          tabBarIcon: ({ focused, color }) =>
            TabIcon(LayoutDashboard, focused, color),
        }}
      />
      {/* <ManagerTab.Screen
        name="ChatTab"
        component={ChatListScreen}
        options={{
          tabBarLabel: "Chat",
          tabBarIcon: ({ focused, color }) =>
            TabIcon(MessageCircle, focused, color),
        }}
      /> */}
      <ManagerTab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profil",
          tabBarIcon: ({ focused, color }) => TabIcon(User, focused, color),
        }}
      />
    </ManagerTab.Navigator>
  );
};

// ─── Owner Tabs ───────────────────────────────────────────────────────────────
const OwnerTab = createBottomTabNavigator();
const OwnerTabs = () => {
  const tabBarStyle = useTabBarStyle();
  return (
    <OwnerTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray[400],
        tabBarStyle,
        tabBarLabelStyle: TAB_LABEL_STYLE,
      }}
    >
      <OwnerTab.Screen
        name="AnalyticsTab"
        component={OwnerDashboard}
        options={{
          tabBarLabel: "Hisobot",
          tabBarIcon: ({ focused, color }) =>
            TabIcon(LayoutDashboard, focused, color),
        }}
      />
      <OwnerTab.Screen
        name="NotificationsTab"
        component={NotificationsScreen}
        options={{
          tabBarLabel: "Xabarlar",
          tabBarIcon: ({ focused, color }) => TabIcon(Bell, focused, color),
        }}
      />
      <OwnerTab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profil",
          tabBarIcon: ({ focused, color }) => TabIcon(User, focused, color),
        }}
      />
    </OwnerTab.Navigator>
  );
};

// ─── Admin Tabs ───────────────────────────────────────────────────────────────
const AdminTab = createBottomTabNavigator();
const AdminTabs = () => {
  const tabBarStyle = useTabBarStyle();
  return (
    <AdminTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray[400],
        tabBarStyle,
        tabBarLabelStyle: TAB_LABEL_STYLE,
      }}
    >
      <AdminTab.Screen
        name="SystemTab"
        component={AdminDashboard}
        options={{
          tabBarLabel: "Tizim",
          tabBarIcon: ({ focused, color }) =>
            TabIcon(LayoutDashboard, focused, color),
        }}
      />
      <AdminTab.Screen
        name="NotificationsTab"
        component={NotificationsScreen}
        options={{
          tabBarLabel: "Xabarlar",
          tabBarIcon: ({ focused, color }) => TabIcon(Bell, focused, color),
        }}
      />
      <AdminTab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profil",
          tabBarIcon: ({ focused, color }) => TabIcon(User, focused, color),
        }}
      />
    </AdminTab.Navigator>
  );
};

// ─── Root Navigator ────────────────────────────────────────────────────────────
export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) return <SplashScreen />;

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <RootStack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            {user.role === "admin" && (
              <RootStack.Screen name="AdminTabs" component={AdminTabs} />
            )}
            {user.role === "owner" && (
              <RootStack.Screen name="OwnerTabs" component={OwnerTabs} />
            )}
            {user.role === "manager" && (
              <>
                <RootStack.Screen name="ManagerTabs" component={ManagerTabs} />
                <RootStack.Screen
                  name="Subscription"
                  component={SubscriptionScreen}
                />
                <RootStack.Screen
                  name="CardManagement"
                  component={CardManagementScreen}
                />
              </>
            )}
            {user.role === "student" && (
              <RootStack.Screen name="StudentTabs" component={StudentTabs} />
            )}
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
