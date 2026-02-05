import axios from "axios";

const API_HOST = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// 기본 인스턴스 (모든 요청에 쿠키 허용)
const axiosInstance = axios.create({
    baseURL: `${API_HOST}/api`,
    withCredentials: true,
});


export default axiosInstance;