import React from "react";
import { View, ActivityIndicator, Image, StyleSheet } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { useAppVersionCheck } from "../hooks/useAppVersionCheck";
import { UpdateModal } from "./UpdateModal";
import { ScreenGradientBackground } from "./ScreenGradientBackground";

interface AppVersionGateProps {
  children: React.ReactNode;
}

export function AppVersionGate({ children }: AppVersionGateProps) {
  const { colors, isDark } = useTheme();
  const {
    isChecking,
    isBlocked,
    versionData,
    showSoftUpdate,
    isRetrying,
    dismissSoftUpdate,
    openStore,
    retry,
  } = useAppVersionCheck();

  if (isChecking) {
    return (
      <View style={styles.splash}>
        <ScreenGradientBackground isDark={isDark} />
        <Image
          source={require("../../../assets/images/square-logo.png")}
          style={styles.logo}
        />
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.loader}
        />
      </View>
    );
  }

  const blockingVariant =
    versionData?.updateType === "maintenance" ? "maintenance" : "hard";

  return (
    <>
      {!isBlocked ? children : null}

      {showSoftUpdate && versionData ? (
        <UpdateModal
          visible
          variant="soft"
          title={versionData.title}
          message={versionData.message}
          onUpdate={openStore}
          onLater={dismissSoftUpdate}
        />
      ) : null}

      {isBlocked && versionData ? (
        <UpdateModal
          visible
          variant={blockingVariant}
          title={versionData.title}
          message={versionData.message}
          onUpdate={openStore}
          onRetry={retry}
          isRetrying={isRetrying}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0c1224",
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 24,
    marginBottom: 28,
  },
  loader: {
    marginTop: 8,
  },
});
