import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import ToastManager, { Toast } from "toastify-react-native";
import { useTheme } from "./ThemeContext";

interface ToastContextType {
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

const ToastProviderInner: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { colors } = useTheme();

  const showSuccess = useCallback(
    (message: string, duration: number = 3000) => {
      Toast.show({
        type: "success",
        text1: message,
        position: "top",
        visibilityTime: duration,
        backgroundColor: colors.success,
        textColor: colors.white,
        autoHide: true,
      });
    },
    [colors.success]
  );

  const showError = useCallback(
    (message: string, duration: number = 3000) => {
      Toast.show({
        type: "error",
        text1: message,
        position: "top",
        visibilityTime: duration,
        backgroundColor: colors.error,
        textColor: colors.white,
        autoHide: true,
      });
    },
    [colors.error]
  );

  const showInfo = useCallback(
    (message: string, duration: number = 3000) => {
      Toast.show({
        type: "info",
        text1: message,
        position: "top",
        visibilityTime: duration,
        backgroundColor: colors.primary,
        textColor: colors.white,
        autoHide: true,
      });
    },
    [colors.primary]
  );

  const showWarning = useCallback(
    (message: string, duration: number = 3000) => {
      Toast.show({
        type: "warn",
        text1: message,
        position: "top",
        visibilityTime: duration,
        backgroundColor: colors.warning,
        textColor: colors.white,
        autoHide: true,
      });
    },
    [colors.warning]
  );

  const value = useMemo<ToastContextType>(
    () => ({
      showSuccess,
      showError,
      showInfo,
      showWarning,
    }),
    [showSuccess, showError, showInfo, showWarning]
  );

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
};

// Main ToastProvider that includes ToastManager and theme integration
export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  return (
    <>
      <ToastProviderInner>{children}</ToastProviderInner>
      {/* ToastManager must be rendered at the root level */}
      <ToastManager />
    </>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
