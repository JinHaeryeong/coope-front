import axios from "axios";

const BASE_URL = `http://localhost:8080/api`;

// 기본 인스턴스 (모든 요청에 쿠키 허용)
const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

// JSON용 (기본값)

export default axiosInstance;