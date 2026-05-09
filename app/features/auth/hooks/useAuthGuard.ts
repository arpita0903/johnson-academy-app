import { useState, useEffect, useCallback } from "react";
import { useAppContext } from "../../../context/AppContext";
import { isAuthenticated, fetchUser } from "../../../services/auth";

export interface AuthGuardState {
  isLoading: boolean;
  isAuthenticated: boolean;
  userRole: string | null;
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

  const checkAuth = useCallback(async () => {
    try {
      const authenticated = await isAuthenticated();
      setIsAuth(authenticated);

      if (authenticated) {
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
  }, [login]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    isLoading,
    isAuthenticated: isAuth,
    userRole,
    checkAuth,
  };
}
