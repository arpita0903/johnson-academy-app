import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import Login from "./components/Login";
import Homepage from "./Student/Homepage";
import CourseDetails from "./Student/CourseDetails";
import DetailScreen from "./Student/DetailScreen";
import TeacherDashboard from "./Teacher/Dashboard";
import StudentList from "./Teacher/StudentList";
import TeacherCourseDetail from "./Teacher/TeacherCourseDetail";
import ProfileDrawer from "./components/ProfileDrawer";

import { AppProvider } from "./context/AppContext";
import { Image, TouchableOpacity } from "react-native";
import profile from "../assets/images/profileDefault.jpg";
import AssignmentList from "./Teacher/AssignmentList";
import PublishAssignment from "./Teacher/PublishAssignment";

import Icon from "react-native-vector-icons/Foundation";
import StudentDetailsScreen from "./Teacher/StudentDetailsScreen";

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const StackScreens = ({ navigation, route }) => (
  <Stack.Navigator>
    <Stack.Screen
      name="Login"
      component={Login}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Course"
      component={CourseDetails}
      options={({ route, navigation }) => ({
        headerRight: () => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("StudentDetailsScreen", {
                selectedStudent: route.params?.student,
              })
            }
          >
            <Icon
              name="results-demographics"
              size={32}
              color="#7a58f5"
              style={{ width: 40, marginRight: 10, borderRadius: 20 }}
            />
          </TouchableOpacity>
        ),
      })}
    />

    <Stack.Screen
      name="Homepage"
      component={Homepage}
      options={{
        headerRight: () => (
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Image
              source={profile}
              resizeMode="contain"
              style={{ width: 40, marginRight: 10, borderRadius: 20 }}
            />
          </TouchableOpacity>
        ),
      }}
    />
    <Stack.Screen name="Detail" component={DetailScreen} />
    <Stack.Screen name="TeacherDashboard" component={TeacherDashboard} />
    <Stack.Screen name="StudentList" component={StudentList} />
    <Stack.Screen name="TeacherCourseDetail" component={TeacherCourseDetail} />
    <Stack.Screen name="PublishAssignment" component={PublishAssignment} />
    <Stack.Screen name="AssignmentList" component={AssignmentList} />
    <Stack.Screen
      name="StudentDetailsScreen"
      component={StudentDetailsScreen}
    />
  </Stack.Navigator>
);

const App = () => {
  return (
    <AppProvider>
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
    </AppProvider>
  );
};

export default App;
