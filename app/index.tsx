import React from 'react'
import { SafeAreaView, StyleSheet } from 'react-native'

// import "./global.css"

import { createStackNavigator } from '@react-navigation/stack';

import Login from './components/Login';
import Homepage from './Student/Homepage';
import CourseDetails from './Student/CourseDetails';
import DetailScreen from './Student/DetailScreen';
import TeacherDashboard from './Teacher/Dashboard';
import StudentList from './Teacher/StudentList';

const Stack = createStackNavigator()

const index = () => {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Stack.Navigator>
                <Stack.Screen name="Home" component={Login} options={{ headerShown: false }} />
                <Stack.Screen name="Courses" component={CourseDetails} />
                <Stack.Screen name="Homepage" component={Homepage} />
                <Stack.Screen name="Detail" component={DetailScreen} />
                <Stack.Screen name="TeacherDashboard" component={TeacherDashboard} options={{ title: 'Dashboard' }} />
                <Stack.Screen name="StudentList" component={StudentList} options={{ title: 'Students' }} />
            </Stack.Navigator>
        </SafeAreaView >

    )
}

export default index

const styles = StyleSheet.create({})