import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useTheme } from "../../../context/ThemeContext";
import { useAuthGuard } from "../hooks/useAuthGuard";
import Login from "./Login";

interface AuthNavigatorProps {
  navigation: any;
}

const AuthNavigator: React.FC<AuthNavigatorProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { isLoading, isAuthenticated, userRole } = useAuthGuard();

  useEffect(() => {
    if (!isLoading && isAuthenticated && userRole) {
      if (userRole === "teacher") {
        navigation.replace("TeacherDashboard");
      } else {
        navigation.replace("Homepage");
      }
    }
  }, [isLoading, isAuthenticated, userRole, navigation]);

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

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
};

export default AuthNavigator;
