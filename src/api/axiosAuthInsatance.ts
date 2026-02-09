import { useAuthStore } from "@/store/authStore";
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import axiosInstance from "./axiosInstance";
import { toast } from "sonner";

const API_HOST = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";


interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}


const axiosAuthInstance = axios.create({
    baseURL: `${API_HOST}/api`,
    withCredentials: true,
});

// 모든 요청 직전에 Access Token을 가로채서 헤더에 삽입
axiosAuthInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const accessToken = useAuthStore.getState().accessToken;

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

// 401(만료) 에러 발생 시 자동으로 토큰 재발급 시도
axiosAuthInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const status = error.response?.status;
        const originalRequest = error.config as CustomAxiosRequestConfig;

        // 401 에러 감지 및 재시도 안 한 요청인 경우
        if (status === 401 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;

            console.log("액세스 토큰 만료 감지. 재발급을 시도합니다.");

            try {
                const res = await axiosInstance.post<{ accessToken: string }>("/auth/refresh");
                const newAccessToken = res.data.accessToken;

                // Zustand 갱신
                const currentUser = useAuthStore.getState().user;
                if (currentUser) {
                    useAuthStore.getState().signIn(newAccessToken, currentUser);
                }

                // 실패했던 원래 요청 재시도
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return axiosAuthInstance(originalRequest);
            } catch (refreshError) {
                if (axios.isAxiosError(refreshError)) {
                    console.error("리프레시 토큰 만료 또는 서버 에러:", refreshError.response?.data?.message);
                } else {
                    console.error("알 수 없는 에러 발생:", refreshError);
                }

                // 로그아웃
                useAuthStore.getState().signOut();

                // 에러 던지기
                return Promise.reject(refreshError);
            }
        }

        if (status === 403) {
            toast.error("접근 권한이 없습니다.");
            window.location.href = "/";
        }

        return Promise.reject(error);
    }
);

export default axiosAuthInstance;