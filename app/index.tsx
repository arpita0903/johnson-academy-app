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
import TeacherCourseDetail from "./Teacher/TeacherCourseDetail";
import ProfileDrawer from "./components/ProfileDrawer";

import { AppProvider, useAppContext } from "./context/AppContext";
import { TeacherProvider } from "./context/TeacherContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { Image, TouchableOpacity } from "react-native";
import AssignmentList from "./Teacher/AssignmentList";
import PublishAssignment from "./Teacher/PublishAssignment";

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
          backgroundColor: colors.card,
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
        component={CourseDetails}
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
      />

      <Stack.Screen
        name="Homepage"
        options={{
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
      <Stack.Screen name="ModuleDetail" component={ModuleDetailScreen} />
      <Stack.Screen
        name="TeacherDashboard"
        options={{
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
        name="PublishAssignment"
        options={{
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
          <ProtectedWrapper {...props} requiredRole="teacher">
            <PublishAssignment {...props} />
          </ProtectedWrapper>
        )}
      </Stack.Screen>
      <Stack.Screen
        name="AssignmentList"
        options={{
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
            <AssignmentList {...props} />
          </ProtectedWrapper>
        )}
      </Stack.Screen>
      <Stack.Screen
        name="StudentDetailsScreen"
        options={{
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
            <StudentDetailsScreen {...props} />
          </ProtectedWrapper>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

const App = () => {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <ThemeProvider>
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
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;
