import React from "react";
import { View, ActivityIndicator } from "react-native";
import { useTheme } from "../../../context/ThemeContext";
import { useAuthGuard } from "../hooks/useAuthGuard";
import Login from "./Login";

interface ProtectedWrapperProps {
  children: React.ReactNode;
  navigation: any;
  requiredRole?: "student" | "teacher" | "admin";
  fallbackScreen?: string;
}

const ProtectedWrapper: React.FC<ProtectedWrapperProps> = ({
  children,
  navigation,
  requiredRole,
}) => {
  const { colors } = useTheme();
  const { isLoading, isAuthenticated, userRole } = useAuthGuard();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Login navigation={navigation} />;
  }

  if (requiredRole && userRole !== requiredRole) {
    if (userRole === "teacher") {
      navigation.replace("TeacherDashboard");
    } else {
      navigation.replace("Homepage");
    }
    return null;
  }

  return <>{children}</>;
};

export default ProtectedWrapper;
