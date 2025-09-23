import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useAppContext } from "../context/AppContext";
import { isAuthenticated, fetchUser } from "../services/auth";
import Login from "./Login";
import Homepage from "../Student/Homepage";
import TeacherDashboard from "../Teacher/Dashboard";

interface AuthNavigatorProps {
  navigation: any;
}

const AuthNavigator: React.FC<AuthNavigatorProps> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { setUser } = useAppContext();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const authenticated = await isAuthenticated();
        setIsAuth(authenticated);

        if (authenticated) {
          // Fetch user data to determine role
          const userData = await fetchUser();
          if (userData) {
            setUser(userData);
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
  }, [setUser]);

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

  // User is authenticated, redirect based on role
  if (userRole === "teacher") {
    return <TeacherDashboard navigation={navigation} />;
  } else {
    return <Homepage navigation={navigation} />;
  }
};

export default AuthNavigator;
