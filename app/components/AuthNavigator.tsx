import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useAppContext } from "../context/AppContext";
import { isAuthenticated, fetchUser } from "../services/auth";
import Login from "./Login";

interface AuthNavigatorProps {
  navigation: any;
}

const AuthNavigator: React.FC<AuthNavigatorProps> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { login } = useAppContext();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const authenticated = await isAuthenticated();
        setIsAuth(authenticated);

        if (authenticated) {
          // Fetch user data and restore full context (user, role, userId, isAuthenticated)
          const userData = await fetchUser();
          if (userData) {
            login(userData);
            setUserRole(userData.role);
          }
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        setIsAuth(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- run only on mount

  useEffect(() => {
    if (!isLoading && isAuth && userRole) {
      // Navigate to the proper Stack screen so the header (Dashboard title, logo, menu) is shown
      if (userRole === "teacher") {
        navigation.replace("TeacherDashboard");
      } else {
        navigation.replace("Homepage");
      }
    }
  }, [isLoading, isAuth, userRole, navigation]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#8a1dc2" />
      </View>
    );
  }

  if (!isAuth) {
    return <Login navigation={navigation} />;
  }

  // Brief loading while navigation.replace() completes
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#8a1dc2" />
    </View>
  );
};

export default AuthNavigator;
