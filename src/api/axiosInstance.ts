import axios from "axios";
//사용자 요청이 필요없는 서비스 요청시 사용
const axiosInstance = axios.create({
    baseURL: `http://localhost:8080/api`,
    headers: {
        "Content-Type": "application/json",
    },
});

export default axiosInstance;