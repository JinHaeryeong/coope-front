import type { UserInfo } from '@/store/useAuthStore';
import axiosAuthInstance from './axiosAuthInstance';
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

export interface UserSearchResponse {
    id: number;
    nickname: string;
    userIcon: string;
    status: string;
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

export const apiSendEmail = async (email: string) => {
    const response = await axiosInstance.post("/auth/email/send", { email });
    return response.data;
};

// 인증번호 확인
export const apiVerifyEmail = async (email: string, code: string) => {
    const response = await axiosInstance.post("/auth/email/verify", { email, code });
    return response.data;
};

export const apiGetMe = async () => {
    // axiosAuthInstance를 사용하면 인터셉터가 자동으로 Authorization 헤더를 붙여줍니다.
    const response = await axiosAuthInstance.get<UserInfo>("/user/me");
    return response.data;
}

export const apiRefreshToken = async () => {
    const response = await axiosInstance.post<{ accessToken: string }>("/auth/refresh");
    return response.data;
};

export const apiSearchUser = async (nickname: string) => {
    const response = await axiosAuthInstance.get<UserSearchResponse>(`/user/search`, {
        params: { nickname }
    });
    return response.data;
}

export const apiVerifyPassword = async (password: string) => {
    await axiosAuthInstance.post("/user/verify-password", { password });
};

export const apiUpdateProfile = async (formData: FormData) => {
    const response = await axiosAuthInstance.patch<UserInfo>("/user/profile", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};