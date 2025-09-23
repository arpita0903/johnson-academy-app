import api from "./axiosInstance";

export const courseData = async () => {
  try {
    const response = await api.get("/courses");
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Something went wrong" };
  }
};
