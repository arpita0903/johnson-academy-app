
import api from './axiosInstance';

export const courseData = () => {
    try {
        const response = api.get('/courses');

        return response.data;
    } catch (error) {
        throw error.response?.data || {message: 'Something went wrong'};
    }
};
