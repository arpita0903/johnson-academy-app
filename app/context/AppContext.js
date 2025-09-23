import React, { createContext, useState, useContext } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (userData) => {
    setUser(userData);
    setRole(userData.role);
    setUserId(userData.id);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    setUserId(null);
    setIsAuthenticated(false);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        role,
        userId,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
