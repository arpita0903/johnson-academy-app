import React, { useEffect } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { QueryClientProvider } from "@tanstack/react-query";
import { focusManager } from "@tanstack/react-query";
import { AppState, Platform } from "react-native";

import { queryClient } from "./config/queryClient";

import AuthNavigator from "./features/auth/components/AuthNavigator";
import ProtectedWrapper from "./features/auth/components/ProtectedWrapper";
import Login from "./features/auth/components/Login";
import Homepage from "./features/student/screens/Homepage";
import CourseDetails from "./features/student/screens/CourseDetails";
import DetailScreen from "./features/student/screens/DetailScreen";
import ModuleDetailScreen from "./features/student/screens/ModuleDetailScreen";
import TeacherDashboard from "./features/teacher/screens/Dashboard";
import StudentList from "./features/teacher/screens/StudentList";
import TeacherCourseDetail from "./features/teacher/screens/TeacherCourseDetail";
import ProfileDrawer from "./features/profile/components/ProfileDrawer";
import ProfileScreen from "./features/profile/screens/ProfileScreen";

import { AppProvider, useAppContext } from "./context/AppContext";
import { TeacherProvider } from "./context/TeacherContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { Provider as PaperProvider } from "react-native-paper";
import { Image, TouchableOpacity, View } from "react-native";

import { ScreenGradientBackground } from "./shared/components/ScreenGradientBackground";
import { AppVersionGate } from "./shared/components/AppVersionGate";

import Icon from "react-native-vector-icons/Foundation";
import StudentDetailsScreen from "./features/teacher/screens/StudentDetailsScreen";

type MainStackParamList = {
  Home: undefined;
  Login: undefined;
  Course: Record<string, unknown> | undefined;
  Homepage: undefined;
  Detail: Record<string, unknown> | undefined;
  ModuleDetail: Record<string, unknown> | undefined;
  TeacherDashboard: undefined;
  StudentList: Record<string, unknown> | undefined;
  TeacherCourseDetail: Record<string, unknown> | undefined;
  StudentDetailsScreen: Record<string, unknown> | undefined;
  Profile: undefined;
};

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator<MainStackParamList>();

interface StackScreensProps {
  navigation: any;
  route: any;
}

const StackScreens: React.FC<StackScreensProps> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user } = useAppContext();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          // dark blue
          backgroundColor: "#0c1224",
          borderBottomWidth: 1,
          borderBottomColor: colors.cardBorder,
        },
        headerTitleStyle: {
          fontWeight: "600",
          color: colors.text,
        },
        headerTintColor: colors.primary,
      }}
      initialRouteName="Home"
    >
      <Stack.Screen
        name="Home"
        component={AuthNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={Login}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Course"
        options={({ route, navigation }) => ({
          headerRight:
            user?.role === "teacher"
              ? () => (
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("StudentDetailsScreen", {
                        selectedStudent: (route.params as any)?.student,
                        course: (route.params as any)?.course,
                      })
                    }
                  >
                    <Icon
                      name="results-demographics"
                      size={32}
                      color={colors.primary}
                      style={{ width: 40, marginRight: 10, borderRadius: 20 }}
                    />
                  </TouchableOpacity>
                )
              : undefined,
        })}
      >
        {(props) => <CourseDetails {...(props as any)} />}
      </Stack.Screen>

      <Stack.Screen
        name="Homepage"
        options={{
          headerShown: true,
          headerTitle: "Johnson's Academy",
          headerLeftContainerStyle: { paddingLeft: 12 },
          headerLeft: () => (
            <Image
              source={require("../assets/images/square-logo.png")}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                overflow: "hidden",
              }}
            />
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
              <Icon
                name="list"
                size={32}
                color={colors.primary}
                style={{ width: 40, marginRight: 10 }}
              />
            </TouchableOpacity>
          ),
        }}
      >
        {(props) => (
          <ProtectedWrapper
            navigation={props.navigation}
            requiredRole="student"
          >
            <Homepage {...props} />
          </ProtectedWrapper>
        )}
      </Stack.Screen>
      <Stack.Screen
        name="Profile"
        options={{
          headerTitle: "Profile",
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
              <Icon
                name="list"
                size={32}
                color={colors.primary}
                style={{ width: 40, marginRight: 10 }}
              />
            </TouchableOpacity>
          ),
        }}
      >
        {(props) => (
          <ProtectedWrapper navigation={props.navigation}>
            <ProfileScreen {...props} />
          </ProtectedWrapper>
        )}
      </Stack.Screen>
      <Stack.Screen name="Detail" component={DetailScreen} />
      <Stack.Screen name="ModuleDetail">
        {(props) => <ModuleDetailScreen {...(props as any)} />}
      </Stack.Screen>
      <Stack.Screen
        name="TeacherDashboard"
        options={{
          headerTitle: "Johnson's Academy",
          headerLeftContainerStyle: { paddingLeft: 12 },
          headerLeft: () => (
            <Image
              source={require("../assets/images/square-logo.png")}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                overflow: "hidden",
              }}
            />
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
              <Icon
                name="list"
                size={32}
                color={colors.primary}
                style={{ width: 40, marginRight: 10 }}
              />
            </TouchableOpacity>
          ),
        }}
      >
        {(props) => (
          <ProtectedWrapper
            navigation={props.navigation}
            requiredRole="teacher"
          >
            <TeacherDashboard {...props} />
          </ProtectedWrapper>
        )}
      </Stack.Screen>
      <Stack.Screen
        name="StudentList"
        options={{
          headerTitle: "Student List",
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
              <Icon
                name="list"
                size={32}
                color={colors.primary}
                style={{ width: 40, marginRight: 10 }}
              />
            </TouchableOpacity>
          ),
        }}
      >
        {(props) => (
          <ProtectedWrapper
            navigation={props.navigation}
            requiredRole="teacher"
          >
            <StudentList {...props} />
          </ProtectedWrapper>
        )}
      </Stack.Screen>
      <Stack.Screen
        name="TeacherCourseDetail"
        options={{
          headerTitle: "Course Detail",
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
              <Icon
                name="list"
                size={32}
                color={colors.primary}
                style={{ width: 40, marginRight: 10 }}
              />
            </TouchableOpacity>
          ),
        }}
      >
        {(props) => (
          <ProtectedWrapper
            navigation={props.navigation}
            requiredRole="teacher"
          >
            <TeacherCourseDetail {...props} />
          </ProtectedWrapper>
        )}
      </Stack.Screen>
      <Stack.Screen
        name="StudentDetailsScreen"
        options={{
          headerTitle: "Student Details",
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
              <Icon
                name="list"
                size={32}
                color={colors.primary}
                style={{ width: 40, marginRight: 10 }}
              />
            </TouchableOpacity>
          ),
        }}
      >
        {(props) => (
          <ProtectedWrapper
            navigation={props.navigation}
            requiredRole="teacher"
          >
            <StudentDetailsScreen />
          </ProtectedWrapper>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

const NavigationLayer: React.FC = () => {
  const { isDark } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <ScreenGradientBackground isDark={isDark} />
      <Drawer.Navigator
        screenOptions={{ drawerPosition: "right" }}
        drawerContent={(props) => <ProfileDrawer {...props} />}
      >
        <Drawer.Screen
          name="Main"
          component={StackScreens}
          options={{ headerShown: false }}
        />
      </Drawer.Navigator>
    </View>
  );
};

const App = () => {
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (status) => {
      if (Platform.OS !== "web") {
        focusManager.setFocused(status === "active");
      }
    });
    return () => subscription.remove();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <PaperProvider>
          <ThemeProvider>
            <ToastProvider>
              <AppProvider>
                <TeacherProvider>
                  {/* NavigationContainer provided by Expo Router - do not nest */}
                  <AppVersionGate>
                    <NavigationLayer />
                  </AppVersionGate>
                </TeacherProvider>
              </AppProvider>
            </ToastProvider>
          </ThemeProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
};

export default App;
