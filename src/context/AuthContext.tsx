import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import apiClient from "../api/client";

export type UserRole = "admin" | "owner" | "manager" | "student";

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (
    identifier: string,
    pass: string,
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      console.log("Checking login status...");
      const storedUser = await AsyncStorage.getItem("user");
      const token = await SecureStore.getItemAsync("token");

      console.log("Stored user found:", !!storedUser);
      console.log("Token found:", !!token);

      if (storedUser && token) {
        const parsedUser = JSON.parse(storedUser);
        console.log("Restoring session for:", parsedUser.email);
        setUser(parsedUser);
      } else {
        console.log("No stored session found.");
      }
    } catch (error) {
      console.error("Failed to load login status", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (identifier: string, pass: string) => {
    try {
      const response = await apiClient.post("/auth/login", {
        identifier,
        password: pass,
      });
      const { access_token, user } = response.data;

      await SecureStore.setItemAsync("token", access_token);
      await AsyncStorage.setItem("user", JSON.stringify(user));

      setUser(user);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync("token");
      await AsyncStorage.removeItem("user");
      setUser(null);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const updateUser = async (data: Partial<User>) => {
    try {
      const response = await apiClient.patch("/auth/profile", data);
      const updatedUser = {
        ...user,
        ...response.data,
        id: response.data.id || response.data._id || user?.id || user?._id,
      } as User;
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Update failed",
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
