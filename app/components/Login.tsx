import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    TextInput,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
    ScrollView,
    Platform,
} from "react-native";

const Login = ({ navigation }) => {
    const bannerImg = require("../../assets/images/bannerImg.png");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState({});
    const [role, setRole] = useState("");

    const handleSubmit = () => {
        setError({});
        if (!role) return setError({ role: "Please select your role (Student or Teacher)" });
        // if (!name) return setError({ name: "Please enter your name" });
        // if (!password) return setError({ password: "Please enter your password" });
        if (role === "teacher") {
            navigation.navigate("TeacherDashboard");
        } else {
            navigation.navigate("Homepage");

        }
        setName("");
        setPassword("");
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                    <Image source={bannerImg} resizeMode="contain" style={styles.banner} />
                    <View style={styles.container}>
                        <Text style={styles.title}>Welcome to Johnson Academy!</Text>
                        <Text style={styles.loginText}>Login to your account</Text>

                        <View style={styles.roleContainer}>
                            <TouchableOpacity
                                style={[styles.roleCard, role === "student" && styles.selectedRole]}
                                onPress={() => setRole("student")}
                            >
                                <Text style={[styles.roleText, role === "student" && styles.selectedRoleText]}>
                                    🎓 Student
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.roleCard, role === "teacher" && styles.selectedRole]}
                                onPress={() => setRole("teacher")}
                            >
                                <Text style={[styles.roleText, role === "teacher" && styles.selectedRoleText]}>
                                    🧑‍🏫 Teacher
                                </Text>
                            </TouchableOpacity>
                        </View>
                        {error?.role && <Text style={styles.errorText}>{error.role}</Text>}

                        <TextInput
                            style={styles.input}
                            placeholder="Enter your name"
                            placeholderTextColor="#A8A8A8"
                            value={name}
                            onChangeText={setName}
                        />
                        {error?.name && <Text style={styles.errorText}>{error.name}</Text>}

                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            placeholderTextColor="#A8A8A8"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                        {error?.password && <Text style={styles.errorText}>{error.password}</Text>}

                        <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
                            <Text style={styles.btnText}>Login</Text>
                        </TouchableOpacity>

                        <Text style={styles.forgotPassword}>Forgot your password?</Text>
                        <Text style={styles.account}>
                            Don't have an account? <Text style={styles.signup}>Sign Up</Text>
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
};

export default Login;

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        // justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    banner: {
        width: "100%",
        height: 200,
        marginBottom: 20,
    },
    container: {
        width: "90%",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#ffffff",
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    title: {
        fontSize: 26,
        textAlign: "center",
        fontWeight: "bold",
        color: "#701cba",
        marginBottom: 5,
    },
    loginText: {
        fontSize: 16,
        color: "#666",
        marginBottom: 20,
    },
    roleContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 15,
        gap: 15,
    },
    roleCard: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: "#f7f7f7",
    },
    selectedRole: {
        backgroundColor: "#701cba",
        borderColor: "#701cba",
    },
    roleText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    selectedRoleText: {
        color: "#fff",
    },
    input: {
        width: "100%",
        padding: 12,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        marginTop: 15,
        color: "#000",
    },
    errorText: {
        alignSelf: "flex-start",
        color: "red",
        marginTop: 5,
        paddingLeft: 4,
    },
    btn: {
        backgroundColor: "#701cba",
        paddingVertical: 12,
        borderRadius: 6,
        marginTop: 30,
        width: "100%",
        alignItems: "center",
    },
    btnText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
    forgotPassword: {
        marginTop: 15,
        fontSize: 14,
        color: "#999",
    },
    account: {
        marginTop: 30,
        fontSize: 16,
        color: "#666",
    },
    signup: {
        color: "#701cba",
        fontWeight: "bold",
    },
});
