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