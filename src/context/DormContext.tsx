import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../api/client";
import { useAuth } from "./AuthContext";

export interface Dorm {
  _id: string;
  name: string;
  address?: string;
}

interface DormContextType {
  dorms: Dorm[];
  selectedDorm: Dorm | null;
  loadingDorms: boolean;
  switchDorm: (dormId: string) => Promise<void>;
  refreshDorms: () => Promise<void>;
}

const DormContext = createContext<DormContextType | undefined>(undefined);

export const DormProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [dorms, setDorms] = useState<Dorm[]>([]);
  const [selectedDorm, setSelectedDorm] = useState<Dorm | null>(null);
  const [loadingDorms, setLoadingDorms] = useState(false);

  useEffect(() => {
    if (user && user.role === "manager") {
      refreshDorms();
    } else {
      setDorms([]);
      setSelectedDorm(null);
    }
  }, [user]);

  const refreshDorms = async () => {
    setLoadingDorms(true);
    try {
      const response = await apiClient.get<Dorm[]>("/manager/dorms");
      const dormList = response.data;
      setDorms(dormList);

      const savedDormId = await AsyncStorage.getItem("selectedDormId");
      if (savedDormId) {
        const found = dormList.find((d) => d._id === savedDormId);
        if (found) {
          setSelectedDorm(found);
        } else if (dormList.length > 0) {
          setSelectedDorm(dormList[0]);
        }
      } else if (dormList.length > 0) {
        setSelectedDorm(dormList[0]);
      }
    } catch (error) {
      console.error("Failed to fetch dorms", error);
    } finally {
      setLoadingDorms(false);
    }
  };

  const switchDorm = async (dormId: string) => {
    const found = dorms.find((d) => d._id === dormId);
    if (found) {
      setSelectedDorm(found);
      await AsyncStorage.setItem("selectedDormId", dormId);
    }
  };

  return (
    <DormContext.Provider
      value={{
        dorms,
        selectedDorm,
        loadingDorms,
        switchDorm,
        refreshDorms,
      }}
    >
      {children}
    </DormContext.Provider>
  );
};

export const useDorms = () => {
  const context = useContext(DormContext);
  if (context === undefined) {
    throw new Error("useDorms must be used within a DormProvider");
  }
  return context;
};
