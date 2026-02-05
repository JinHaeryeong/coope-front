import { useAuthStore } from "@/store/authStore";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

export const AdminGuard = ({ children }: { children: React.ReactNode }) => {
    const { user, isLoggedIn } = useAuthStore();
    const location = useLocation();

    // 사용자가 없거나 관리자가 아닌 경우 바로 튕겨내기
    if (!user || user.role !== "ROLE_ADMIN") {
        if (isLoggedIn) {
            toast.error("관리자 권한이 필요한 페이지입니다.");
        }
        return <Navigate to="/notice" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};