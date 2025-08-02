
import api from './axiosInstance';

export const loginUser = async (email, password) => {
    try {
        const response = await api.post('/auth/login', {
            email,
            password,
        });

        return response.data;
    } catch (error) {
        throw error.response?.data || {message: 'Something went wrong'};
    }
};
