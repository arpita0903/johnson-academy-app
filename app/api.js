import axios from "axios";

const axiosInstance = () => {
    const defaultOptions = {
        baseURL: `${process.env.REACT_APP_BACKEND}:${process.env.REACT_APP_BACKEND_PORT}`,
        method: "get",
        headers: {
            "Content-Type": "application/json",
        },
    };

    const instance = axios.create(defaultOptions);

    instance.interceptors.request.use((config) => {
        const token = localStorage.getItem("apiToken");

        if (!config.url.includes("login")) {
            config.headers.Authorization = token ? `Bearer ${token}` : "";
        }
        return config;
    });

    instance.interceptors.response.use(undefined, (error) => {
        const {status, config} = error.response;

        if (
            //!config?.url.includes("update_password") &&
            (status === 403 || status === 401 || status === 502)
        ) {
            window.sessionStorage.removeItem("userObj");
            localStorage.removeItem("userObj");
            localStorage.removeItem("apiToken");
            sessionStorage.removeItem("userObj");
            window.location.href = "/";
        }

        return Promise.reject(error);
    });

    return instance;
};

export default axiosInstance();
