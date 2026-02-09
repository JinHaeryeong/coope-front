import type { UserInfo } from '@/store/authStore';
import axiosAuthInstance from './axiosAuthInsatance';
import axiosInstance from './axiosInstance';

interface SignUpResponse {
    success: boolean;
    message: string;
    email?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    id: number;
    email: string;
    nickname: string;
    userIcon: string;
    role: string;
}

// 회원가입
export const apiSignUp = async (formData: FormData) => {
    const response = await axiosInstance.post<SignUpResponse>("/user/signup", formData);
    return response.data;
}

// 로그인
export const apiLogin = async (loginData: LoginRequest) => {
    const response = await axiosInstance.post<LoginResponse>("/auth/login", loginData);
    return response.data;
}

export const apiGetMe = async () => {
    // axiosAuthInstance를 사용하면 인터셉터가 자동으로 Authorization 헤더를 붙여줍니다.
    const response = await axiosAuthInstance.get<UserInfo>("/user/me");
    return response.data;
}