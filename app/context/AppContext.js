import React, { createContext, useState, useContext, useCallback, useMemo } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = useCallback((userData) => {
    setUser(userData);
    setRole(userData.role);
    setUserId(userData.id);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setRole(null);
    setUserId(null);
    setIsAuthenticated(false);
  }, []);

  const value = useMemo(
    () => ({
      user,
      setUser,
      role,
      userId,
      isAuthenticated,
      login,
      logout,
    }),
    [user, role, userId, isAuthenticated, login, logout]
  );

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
