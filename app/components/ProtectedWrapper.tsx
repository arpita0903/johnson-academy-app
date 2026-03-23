import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useAppContext } from "../context/AppContext";
import { isAuthenticated, fetchUser } from "../services/auth";
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
  fallbackScreen = "Login",
}) => {
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
        setIsAuth(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- run only on mount

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#8a1dc2" />
      </View>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuth) {
    return <Login navigation={navigation} />;
  }

  // If role is required and user doesn't have the required role
  if (requiredRole && userRole !== requiredRole) {
    // Redirect to appropriate screen based on user's actual role
    if (userRole === "teacher") {
      navigation.replace("TeacherDashboard");
    } else {
      navigation.replace("Homepage");
    }
    return null;
  }

  // User is authenticated and has required role (if specified)

  return <>{children}</>;
};

export default ProtectedWrapper;
