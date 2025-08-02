// api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
    baseURL: 'https://johnson-academy-be-latest.onrender.com/v1',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the token
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                config.headers['Authorization'] = `Bearer ${JSON.parse(token)}`;
            }
        } catch (error) {
            console.error('Error fetching token for request:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
