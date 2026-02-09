import axiosAuthInstance from "@/api/axiosAuthInsatance";
import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";

export interface UserInfo {
    id: number;
    email: string;
    nickname: string;
    userIcon: string;
    role: string;
}

interface AuthState {
    accessToken: string | null;
    user: UserInfo | null;
    isLoggedIn: boolean;

    signIn: (accessToken: string, user: UserInfo) => void;
    signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
    devtools(
        persist(
            (set) => ({
                accessToken: null,
                user: null,
                isLoggedIn: false,

                // 로그인 성공 시 호출
                signIn: (accessToken, user) =>
                    set({
                        accessToken,
                        user,
                        isLoggedIn: true,
                    }),

                // 로그아웃 시 호출
                signOut: async () => {
                    try {
                        // 백엔드 로그아웃 API 호출 (쿠키와 DB 토큰 삭제)
                        await axiosAuthInstance.post("/auth/logout");
                    } catch (error) {
                        console.error("로그아웃 API 호출 실패:", error);
                    } finally {
                        // API 호출 성공 여부와 상관없이 클라이언트 상태는 초기화
                        set({
                            accessToken: null,
                            user: null,
                            isLoggedIn: false,
                        });
                        window.location.href = "/";
                    }
                },
            }),
            {
                name: "auth-storage", // 스토리지에 저장될 키 이름
                storage: createJSONStorage(() => localStorage),

                partialize: (state) => ({
                    user: state.user,
                    isLoggedIn: state.isLoggedIn,
                }),
            }
        )
    )
);