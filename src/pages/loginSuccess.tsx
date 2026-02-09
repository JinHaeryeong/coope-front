import { apiGetMe } from "@/api/userApi";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export function LoginSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { signIn, signOut } = useAuthStore();

    useEffect(() => {
        const accessToken = searchParams.get("accessToken");

        if (accessToken) {
            const initLogin = async () => {
                try {
                    signIn(accessToken, { id: 0, email: "", nickname: "", userIcon: "", role: "" });

                    const userInfo = await apiGetMe();

                    signIn(accessToken, userInfo);

                    navigate("/", { replace: true });
                } catch (error) {
                    console.error("로그인 정보 복구 실패:", error);
                    signOut();
                    navigate("/", { replace: true });
                }
            };

            initLogin();
        }
    }, [searchParams, signIn, navigate, signOut]);

    return (
        <div className="flex h-screen w-full items-center justify-center">
            <p className="animate-pulse">로그인 중입니다...</p>
        </div>
    );
}