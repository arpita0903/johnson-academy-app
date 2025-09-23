import api from "./axiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface UserProfile {
  id: string;
  name: string;
  phoneNumber: string;
  profilePicture: string;
  isCompleteProfile: boolean;
}

export interface User {
  name: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  subjects: string[];
  isActive: boolean;
  classes: string[];
  courses: string[];
  progress: string[];
  id: string;
  isCompleteProfile?: boolean;
  phoneNumber?: string;
  profilePicture?: string;
}

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Something went wrong" };
  }
};

/**
 * Fetches the stored user from AsyncStorage
 * @returns {Promise<User|null>} The user object or null if not found
 */
export const fetchUser = async (): Promise<User | null> => {
  try {
    const storedUser = await AsyncStorage.getItem("user");
    if (storedUser) {
      return JSON.parse(storedUser) as User;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user from storage:", error);
    return null;
  }
};

// update user profile
export const updateUserProfile = async (user: UserProfile) => {
  const { id, ...rest } = user;
  try {
    const response = await api.patch(`/users/${id}`, rest);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Something went wrong" };
  }
};

/**
 * Gets only the user ID from AsyncStorage
 * @returns {Promise<string|null>} The user ID or null if not found
 */
export const getUserId = async (): Promise<string | null> => {
  try {
    const storedUser = await AsyncStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser) as User;
      return user.id;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user ID from storage:", error);
    return null;
  }
};

/**
 * Checks if user has a valid access token
 * @returns {Promise<boolean>} True if token exists, false otherwise
 */
export const hasValidToken = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem("token");
    return !!token;
  } catch (error) {
    console.error("Error checking token:", error);
    return false;
  }
};

/**
 * Gets the stored access token
 * @returns {Promise<string|null>} The access token or null if not found
 */
export const getToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      return JSON.parse(token);
    }
    return null;
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

/**
 * Checks if user is authenticated (has both token and user data)
 * @returns {Promise<boolean>} True if authenticated, false otherwise
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const [token, user] = await Promise.all([
      AsyncStorage.getItem("token"),
      AsyncStorage.getItem("user"),
    ]);

    return !!(token && user);
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
};

/**
 * Logs out the user by clearing all authentication data
 */
export const logout = async (): Promise<void> => {
  try {
    await Promise.all([
      AsyncStorage.removeItem("token"),
      AsyncStorage.removeItem("refreshToken"),
      AsyncStorage.removeItem("user"),
    ]);
  } catch (error) {
    console.error("Error during logout:", error);
  }
};
