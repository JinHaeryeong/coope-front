export type { UserInfo } from '../store/useAuthStore';

export interface SignUpResponse {
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
    provider: 'LOCAL' | 'GOOGLE' | 'KAKAO' | (string & {});
}

export interface FindPasswordRequest {
    name: string;
    email: string;
}

export interface ResetPasswordRequest {
    resetToken: string;
    newPassword: string;
}
