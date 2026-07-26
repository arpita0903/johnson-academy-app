import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Platform,
  Image,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useAppContext } from "../../../context/AppContext";
import { useToast } from "../../../context/ToastContext";
import { loginButtonGradientColors } from "../../../theme/colors";
import { loginUser } from "@/app/services/auth";

interface LoginProps {
  navigation: any;
}

interface ErrorState {
  role?: string;
  name?: string;
  password?: string;
  message?: string;
}

const ACCENT_ORANGE = "#FF8C42";
const TEXT_MUTED = "#94A3B8";
const INPUT_BG = "rgba(15, 23, 42, 0.9)";
const INPUT_BORDER = "rgba(148, 163, 184, 0.25)";
const ADMIN_LOGIN_MESSAGE =
  "Admin accounts cannot log in here. Please use the admin portal.";

function LoginBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={["#0f172a", "#0c1220", "#020617"]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          styles.glowOrb,
          { top: -30, left: -70, backgroundColor: "#EC4899" },
        ]}
      />
      <View
        style={[
          styles.glowOrb,
          { top: 40, right: -90, backgroundColor: "#3B82F6" },
        ]}
      />
      <View
        style={[
          styles.glowOrb,
          { bottom: 180, left: -50, backgroundColor: "#8B5CF6" },
        ]}
      />
      <Icon
        name="music-note"
        size={28}
        color="rgba(96, 165, 250, 0.35)"
        style={{ position: "absolute", top: "12%", left: "8%" }}
      />
      <Icon
        name="music-note"
        size={22}
        color="rgba(244, 114, 182, 0.3)"
        style={{ position: "absolute", top: "18%", right: "12%" }}
      />
      <Icon
        name="graphic-eq"
        size={20}
        color="rgba(148, 163, 184, 0.2)"
        style={{ position: "absolute", bottom: "22%", right: "10%" }}
      />
    </View>
  );
}

function LoginButtonGradient({
  style,
  children,
}: {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  return (
    <LinearGradient
      colors={loginButtonGradientColors}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={style}
    >
      {children}
    </LinearGradient>
  );
}

const Login = ({ navigation }: LoginProps) => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<ErrorState>({});
  const { login } = useAppContext();
  const { showError } = useToast();

  const handleSubmit = async () => {
    setError({});

    if (!name) return setError({ name: "Please enter your email" });
    if (!password) return setError({ password: "Please enter your password" });

    try {
      const data = await loginUser(name, password);
      const accessToken = data?.tokens?.access?.token;
      const refreshToken = data?.tokens?.refresh?.token;
      const user = data?.user;

      if (!accessToken || !refreshToken || !user) {
        throw new Error("Missing login data");
      }

      if (user.role?.trim().toLowerCase() === "admin") {
        throw new Error(ADMIN_LOGIN_MESSAGE);
      }

      await AsyncStorage.setItem("token", JSON.stringify(accessToken));
      await AsyncStorage.setItem("refreshToken", refreshToken);
      await AsyncStorage.setItem("user", JSON.stringify(user));

      login(user);

      if (user.role === "teacher") {
        navigation.replace("TeacherDashboard");
      } else {
        navigation.replace("Homepage");
      }

      setName("");
      setPassword("");
    } catch (err: any) {
      console.error("err", JSON.stringify(err));
      showError(err.message || "Invalid credentials");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <LoginBackground />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
          style={styles.flex}
        >
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.centerBlock}>
              <View style={styles.brandBlock}>
                <View style={styles.logoRow}>
                  <Image
                    source={require("../../../../assets/images/round-logo.png")}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                  <Text style={styles.tm}>™</Text>
                </View>
                <Text style={styles.welcomeLine}>Welcome to</Text>
                <Text style={styles.academyTitle}>Johnson Academy!</Text>
                <Text style={styles.subLine}>
                  <Text style={styles.subMusic}>Music </Text>
                  <Text style={styles.subNeutral}>Inspires and </Text>
                  <Text style={styles.subDance}>Dance </Text>
                  <Text style={styles.subNeutral}>Ignites</Text>
                </Text>
                <View style={styles.noteDivider}>
                  <View style={styles.dividerLine} />
                  <Icon
                    name="music-note"
                    size={18}
                    color="rgba(148, 163, 184, 0.7)"
                  />
                  <View style={styles.dividerLine} />
                </View>
              </View>

              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Login to your account</Text>

                <View style={styles.inputShell}>
                  <Icon
                    name="mail-outline"
                    size={22}
                    color="#64748B"
                    style={styles.inputLeading}
                  />
                  <TextInput
                    style={styles.inputField}
                    placeholder="john@example.com"
                    placeholderTextColor={TEXT_MUTED}
                    value={name}
                    onChangeText={setName}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {error?.name ? (
                  <Text style={styles.errorText}>{error.name}</Text>
                ) : null}

                <View style={styles.inputShell}>
                  <Icon
                    name="lock-outline"
                    size={22}
                    color="#64748B"
                    style={styles.inputLeading}
                  />
                  <TextInput
                    style={styles.inputField}
                    placeholder="Password"
                    placeholderTextColor={TEXT_MUTED}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    style={styles.inputTrailing}
                  >
                    <Icon
                      name={showPassword ? "visibility" : "visibility-off"}
                      size={22}
                      color="#64748B"
                    />
                  </TouchableOpacity>
                </View>
                {error?.password ? (
                  <Text style={styles.errorText}>{error.password}</Text>
                ) : null}

                <View style={styles.formRow}>
                  <TouchableOpacity
                    style={styles.rememberWrap}
                    onPress={() => setRememberMe(!rememberMe)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        rememberMe && styles.checkboxChecked,
                      ]}
                    >
                      {rememberMe ? (
                        <Icon name="check" size={16} color="#fff" />
                      ) : null}
                    </View>
                    <Text style={styles.rememberLabel}>Remember me</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      showError("Please contact your administrator to reset.")
                    }
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.forgotLink}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  activeOpacity={0.92}
                  onPress={handleSubmit}
                  style={styles.loginBtnOuter}
                >
                  <LoginButtonGradient style={styles.loginBtnGradient}>
                    <Icon
                      name="music-note"
                      size={22}
                      color="#fff"
                      style={styles.btnNote}
                    />
                    <Text style={styles.loginBtnText}>Login</Text>
                  </LoginButtonGradient>
                </TouchableOpacity>
              </View>

              <Text
                style={styles.footerTagline}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                Learn. Express. Liberate.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#020617",
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingVertical: 24,
    alignItems: "stretch",
    width: "100%",
  },
  centerBlock: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    alignItems: "center",
  },
  glowOrb: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    opacity: 0.2,
  },
  brandBlock: {
    width: "100%",
    alignItems: "center",
    marginBottom: 8,
    alignSelf: "center",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  logo: {
    width: 108,
    height: 108,
    borderRadius: 54,
  },
  tm: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 12,
    marginLeft: 2,
    marginTop: 4,
  },
  welcomeLine: {
    color: "#E2E8F0",
    fontSize: 17,
    fontWeight: "500",
    marginBottom: 4,
  },
  academyTitle: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subLine: {
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  subMusic: {
    color: "#93C5FD",
    fontWeight: "600",
  },
  subNeutral: {
    color: "#CBD5E1",
    fontWeight: "500",
  },
  subDance: {
    color: "#F472B6",
    fontWeight: "600",
  },
  noteDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    gap: 12,
    paddingHorizontal: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(148, 163, 184, 0.35)",
  },
  formCard: {
    width: "100%",
    maxWidth: "100%",
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 24,
    marginTop: 6,
  },
  formTitle: {
    color: ACCENT_ORANGE,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  inputShell: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: INPUT_BG,
    borderWidth: 1,
    borderColor: INPUT_BORDER,
    borderRadius: 14,
    marginBottom: 12,
  },
  inputLeading: {
    marginLeft: 14,
  },
  inputTrailing: {
    padding: 14,
    paddingLeft: 8,
  },
  inputField: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#F1F5F9",
  },
  errorText: {
    alignSelf: "flex-start",
    color: "#FCA5A5",
    marginTop: -6,
    marginBottom: 8,
    paddingLeft: 4,
    fontSize: 13,
  },
  formRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 8,
  },
  rememberWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: ACCENT_ORANGE,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: ACCENT_ORANGE,
    borderColor: ACCENT_ORANGE,
  },
  rememberLabel: {
    color: TEXT_MUTED,
    fontSize: 14,
  },
  forgotLink: {
    color: ACCENT_ORANGE,
    fontSize: 14,
    fontWeight: "600",
  },
  loginBtnOuter: {
    width: "100%",
    marginTop: 18,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#E11D8C",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  loginBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
  },
  btnNote: {
    marginRight: 8,
  },
  loginBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  footerTagline: {
    marginTop: 28,
    fontSize: 26,
    textAlign: "center",
    color: "#F9A8D4",
    fontStyle: "italic",
    ...Platform.select({
      ios: { fontFamily: "Snell Roundhand" },
      android: { fontFamily: "serif" },
    }),
    textShadowColor: "rgba(59, 130, 246, 0.45)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
});

export default Login;
