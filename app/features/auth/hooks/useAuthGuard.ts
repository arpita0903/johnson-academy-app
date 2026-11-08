import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppContext } from "../../../context/AppContext";
import { isAuthenticated, fetchUser, fetchOwnProfile } from "../../../services/auth";
import {
  isStudentProfileComplete,
  needsProfileCardUpdate,
} from "../../profile/utils/studentProfile";

export interface AuthGuardState {
  isLoading: boolean;
  isAuthenticated: boolean;
  userRole: string | null;
  needsStudentProfile: boolean;
  needsProfileCard: boolean;
}

/**
 * Shared hook for auth status checking used by AuthNavigator and ProtectedWrapper.
 * Checks token + user in AsyncStorage, restores AppContext, and returns loading/auth state.
 */
export function useAuthGuard(): AuthGuardState & { checkAuth: () => Promise<void> } {
  const { login } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [needsStudentProfile, setNeedsStudentProfile] = useState(false);
  const [needsProfileCard, setNeedsProfileCard] = useState(false);

  const checkAuth = useCallback(async () => {
    try {
      const authenticated = await isAuthenticated();
      setIsAuth(authenticated);

      if (authenticated) {
        const storedUser = await fetchUser();
        let userData = storedUser;
        if (storedUser?.role === "student" && storedUser.id) {
          try {
            const fresh = await fetchOwnProfile(storedUser.id);
            userData = fresh;
            await AsyncStorage.setItem("user", JSON.stringify(fresh));
          } catch {
            userData = storedUser;
          }
        }
        if (userData) {
          login(userData);
          setUserRole(userData.role);
          setNeedsStudentProfile(
            userData.role === "student" && !isStudentProfileComplete(userData),
          );
          setNeedsProfileCard(needsProfileCardUpdate(userData));
        }
      } else {
        setNeedsStudentProfile(false);
        setNeedsProfileCard(false);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setIsAuth(false);
      setNeedsStudentProfile(false);
      setNeedsProfileCard(false);
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    isLoading,
    isAuthenticated: isAuth,
    userRole,
    needsStudentProfile,
    needsProfileCard,
    checkAuth,
  };
}
