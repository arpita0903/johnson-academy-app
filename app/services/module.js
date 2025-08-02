
import api from './axiosInstance';

export const moduleData = () => {
    try {
        const response = api.get('/modules');

        return response.data;
    } catch (error) {
        throw error.response?.data || {message: 'Something went wrong'};
    }
};
