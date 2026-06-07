import "react-native-gesture-handler";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "./src/context/ThemeContext";
import { AuthProvider } from "./src/context/AuthContext";
import { DormProvider } from "./src/context/DormContext";
import RootNavigator from "./src/navigation/RootNavigator";

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <DormProvider>
            <RootNavigator />
            <StatusBar style="auto" />
          </DormProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
