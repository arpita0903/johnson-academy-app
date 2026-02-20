import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import AuthNavigator from "./components/AuthNavigator";
import ProtectedWrapper from "./components/ProtectedWrapper";
import Login from "./components/Login";
import Homepage from "./Student/Homepage";
import CourseDetails from "./Student/CourseDetails";
import DetailScreen from "./Student/DetailScreen";
import ModuleDetailScreen from "./Student/ModuleDetailScreen";
import TeacherDashboard from "./Teacher/Dashboard";
import StudentList from "./Teacher/StudentList";
import FolderItemsScreen from "./Teacher/FolderItemsScreen";
import TeacherCourseDetail from "./Teacher/TeacherCourseDetail";
import ProfileDrawer from "./components/ProfileDrawer";

import { AppProvider, useAppContext } from "./context/AppContext";
import { TeacherProvider } from "./context/TeacherContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { Provider as PaperProvider } from "react-native-paper";
import { Image, TouchableOpacity } from "react-native";

import Icon from "react-native-vector-icons/Foundation";
import StudentDetailsScreen from "./Teacher/StudentDetailsScreen";

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

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
          backgroundColor: colors.background,
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
          headerTitle: "Dashboard",
          headerLeft: () => (
            <Image
              source={require("../assets/images/logo.png")}
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
      <Stack.Screen name="Detail" component={DetailScreen} />
      <Stack.Screen name="ModuleDetail">
        {(props) => <ModuleDetailScreen {...(props as any)} />}
      </Stack.Screen>
      <Stack.Screen
        name="TeacherDashboard"
        options={{
          headerTitle: "Dashboard",
          headerLeft: () => (
            <Image
              source={require("../assets/images/logo.png")}
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
        name="FolderItems"
        options={({ route }) => ({
          headerTitle: (route.params as any)?.prefix ?? "Classes",
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
        })}
      >
        {(props) => (
          <ProtectedWrapper
            navigation={props.navigation}
            requiredRole="teacher"
          >
            <FolderItemsScreen {...props} />
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

const App = () => {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <PaperProvider>
        <ThemeProvider>
          <ToastProvider>
            <AppProvider>
              <TeacherProvider>
                {/*<NavigationContainer>*/}
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
                {/*</NavigationContainer>*/}
              </TeacherProvider>
            </AppProvider>
          </ToastProvider>
        </ThemeProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

export default App;
