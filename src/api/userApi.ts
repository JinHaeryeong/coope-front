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
    provider: string;
}

export interface UserSearchResponse {
    id: number;
    nickname: string;
    userIcon: string;
    status: string;
}

export const apiSignUp = async (formData: FormData) => {
    const response = await axiosInstance.post<SignUpResponse>("/user", formData);
    return response.data;
}

export const apiLogin = async (loginData: LoginRequest) => {
    const response = await axiosInstance.post<LoginResponse>("/auth/login", loginData);
    return response.data;
}

export const apiSendEmail = async (email: string) => {
    const response = await axiosInstance.post("/auth/email/send", { email });
    return response.data;
};

export const apiVerifyEmail = async (email: string, code: string) => {
    const response = await axiosInstance.post("/auth/email/verify", { email, code });
    return response.data;
};

export const apiGetMe = async () => {
    const response = await axiosAuthInstance.get<UserInfo>("/user/me");
    return response.data;
}

export const apiRefreshToken = async () => {
    const response = await axiosInstance.post<{ accessToken: string }>("/auth/refresh");
    return response.data;
};

export const apiSearchUser = async (nickname: string) => {
    const response = await axiosAuthInstance.get<UserSearchResponse>(`/user`, {
        params: { nickname }
    });
    return response.data;
}

export const apiVerifyPassword = async (password: string) => {
    await axiosAuthInstance.post("/user/me/verify-password", { password });
};

export const apiUpdateProfile = async (formData: FormData) => {
    const response = await axiosAuthInstance.patch<UserInfo>("/user/me", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};