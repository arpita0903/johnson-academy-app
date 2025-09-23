import React, { useState, useEffect } from "react";
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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppContext } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";
import { ThemeColors } from "../theme/colors";
import { loginUser } from "../services/auth";
import { Alert } from "react-native";

interface LoginProps {
  navigation: any;
}

interface ErrorState {
  role?: string;
  name?: string;
  password?: string;
  message?: string;
}

const Login = ({ navigation }: LoginProps) => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<ErrorState>({});
  const { setUser, login } = useAppContext();
  const { colors } = useTheme();

  useEffect(() => {
    const setInitialRole = async () => {
      await AsyncStorage.setItem("role", "admin");
    };
    setInitialRole();
  }, []);

  const handleSubmit = async () => {
    setError({});

    //if (!role)
    //  return setError({ role: "Please select your role (Student or Teacher)" });
    if (!name) return setError({ name: "Please enter your name" });
    if (!password) return setError({ password: "Please enter your password" });

    try {
      const data = await loginUser(name, password);
      const accessToken = data?.tokens?.access?.token;
      const refreshToken = data?.tokens?.refresh?.token;
      const user = data?.user;

      if (!accessToken || !refreshToken || !user) {
        throw new Error("Missing login data");
      }

      await AsyncStorage.setItem("token", JSON.stringify(accessToken)); // store access token
      await AsyncStorage.setItem("refreshToken", refreshToken); // optional
      await AsyncStorage.setItem("user", JSON.stringify(user)); // store user object

      login(user);

      // Navigate to the appropriate screen based on role
      if (user.role === "teacher") {
        navigation.replace("TeacherDashboard");
      } else {
        navigation.replace("Homepage");
      }

      setName("");
      setPassword("");
    } catch (err: any) {
      console.error("err", JSON.stringify(err));
      Alert.alert("Login Failed", err.message || "Invalid credentials");
    }
  };

  const dynamicStyles = createStyles(colors);

  return (
    <SafeAreaView style={dynamicStyles.safeArea} edges={["top"]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={dynamicStyles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={dynamicStyles.container}>
              <Text style={dynamicStyles.title}>
                Welcome to Johnson Academy!
              </Text>
              <Text style={dynamicStyles.loginText}>Login to your account</Text>

              {/* <View style={styles.roleContainer}>
                <TouchableOpacity
                  style={[
                    styles.roleCard,
                    user.role === "student" && styles.selectedRole,
                  ]}
                  onPress={() => setRole("student")}
                >
                  <Text
                    style={[
                      styles.roleText,
                      role === "student" && styles.selectedRoleText,
                    ]}
                  >
                    🎓 Student
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleCard,
                    role === "teacher" && styles.selectedRole,
                  ]}
                  onPress={() => setRole("teacher")}
                >
                  <Text
                    style={[
                      styles.roleText,
                      role === "teacher" && styles.selectedRoleText,
                    ]}
                  >
                    🧑‍🏫 Teacher
                  </Text>
                </TouchableOpacity>
              </View>
              {error?.role && (
                <Text style={styles.errorText}>{error.role}</Text>
              )} */}

              <TextInput
                style={dynamicStyles.input}
                placeholder="Enter your name"
                placeholderTextColor={colors.placeholderText}
                value={name}
                onChangeText={setName}
              />
              {error?.name && (
                <Text style={dynamicStyles.errorText}>{error.name}</Text>
              )}

              <TextInput
                style={dynamicStyles.input}
                placeholder="Enter your password"
                placeholderTextColor={colors.placeholderText}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              {error?.password && (
                <Text style={dynamicStyles.errorText}>{error.password}</Text>
              )}

              <TouchableOpacity
                style={dynamicStyles.btn}
                onPress={handleSubmit}
              >
                <Text style={dynamicStyles.btnText}>Login</Text>
              </TouchableOpacity>

              {/* <Text style={dynamicStyles.forgotPassword}>
                Forgot your password?
              </Text> */}
              {/* <Text style={dynamicStyles.account}>
                Don't have an account?{" "}
                <Text style={dynamicStyles.signup}>Sign Up</Text>
              </Text> */}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
      minHeight: "100%",
    },

    container: {
      width: "90%",
      alignItems: "center",
      padding: 20,
      backgroundColor: colors.card,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    title: {
      fontSize: 28,
      textAlign: "center",
      fontWeight: "bold",
      color: colors.primary,
      marginBottom: 8,
    },
    loginText: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 25,
    },
    roleContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginBottom: 15,
      gap: 15,
    },
    roleCard: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 15,
      backgroundColor: colors.surface,
    },
    selectedRole: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    roleText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    selectedRoleText: {
      color: colors.primaryText,
    },
    input: {
      width: "100%",
      padding: 15,
      borderWidth: 1.5,
      borderColor: colors.inputBorder,
      borderRadius: 10,
      marginTop: 15,
      color: colors.text,
      backgroundColor: colors.inputBackground,
      fontSize: 16,
    },
    errorText: {
      alignSelf: "flex-start",
      color: colors.error,
      marginTop: 5,
      paddingLeft: 4,
      fontSize: 14,
    },
    btn: {
      backgroundColor: colors.primary,
      paddingVertical: 15,
      borderRadius: 10,
      marginTop: 30,
      width: "100%",
      alignItems: "center",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    btnText: {
      color: colors.primaryText,
      fontSize: 18,
      fontWeight: "600",
    },
    forgotPassword: {
      marginTop: 15,
      fontSize: 14,
      color: colors.textMuted,
    },
    account: {
      marginTop: 30,
      fontSize: 16,
      color: colors.textSecondary,
    },
    signup: {
      color: colors.primary,
      fontWeight: "bold",
    },
  });

export default Login;
