import { useAuthStore } from "@/store/useAuthStore";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { toast } from "sonner";

export const AdminGuard = ({ children }: { children?: React.ReactNode }) => {
    const { user, isLoggedIn } = useAuthStore();
    const location = useLocation();

    if (!user || user.role !== "ROLE_ADMIN") {
        if (isLoggedIn) {
            toast.error("관리자 권한이 필요한 페이지입니다.");
        }
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return children ? <>{children}</> : <Outlet />;
};