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

export interface FindEmailRequest {
    name: string;
    nickname: string;
}

export interface FindEmailResponse {
    maskedEmail: string;
    provider: 'LOCAL' | 'GOOGLE' | 'KAKAO' | string; // Provider enum 대응
}

export interface FindPasswordRequest {
    name: string;
    email: string;
}

export interface ResetPasswordRequest {
    resetToken: string;
    newPassword: string;
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

export const apiFindEmail = async (data: FindEmailRequest) => {
    const response = await axiosInstance.post<FindEmailResponse[]>("/auth/find-email", data);
    return response.data;
};

export const apiFindPassword = async (data: FindPasswordRequest) => {
    const response = await axiosInstance.post("/auth/find-password", data);
    return response.data;
};

export const apiUnlockAccount = async (unlockToken: string) => {
    const response = await axiosInstance.post<{ resetToken: string }>(
        "/auth/unlock",
        null,
        { params: { unlockToken } }
    );
    return response.data;
};

export const apiResetPassword = async (data: ResetPasswordRequest) => {
    const response = await axiosInstance.post("/auth/reset-password", data);
    return response.data;
};