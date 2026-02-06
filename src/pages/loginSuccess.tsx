import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export function LoginSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { signIn } = useAuthStore();

    useEffect(() => {
        const accessToken = searchParams.get("accessToken");

        const id = searchParams.get("id");
        const email = searchParams.get("email");
        const nickname = searchParams.get("nickname");
        const userIcon = searchParams.get("userIcon");
        const role = searchParams.get("role");

        if (accessToken && email && nickname) {
            const userInfo = {
                id: Number(id),
                email: email,
                nickname: decodeURIComponent(nickname), // 한글 깨짐 방지
                userIcon: userIcon || "",
                role: role || "ROLE_USER"
            };

            signIn(accessToken, userInfo);

            navigate("/", { replace: true });
        }
    }, [searchParams, signIn, navigate]);

    return (
        <div className="flex h-screen w-full items-center justify-center">
            <p className="text-sm text-muted-foreground animate-pulse">
                로그인 정보를 확인 중입니다...
            </p>
        </div>
    );
}