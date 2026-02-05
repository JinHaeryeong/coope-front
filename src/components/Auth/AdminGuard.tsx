import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

export const AdminGuard = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuthStore();
    const location = useLocation();
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        if (user && user.role === "ROLE_ADMIN") {
            setIsVerified(true);
        } else {
            toast.error("관리자 권한이 필요한 페이지입니다.");
        }
    }, [user]);

    if (!isVerified) {
        if (!user || user.role !== "ROLE_ADMIN") {
            return <Navigate to="/notice" state={{ from: location }} replace />;
        }
        return null;
    }

    return <>{children}</>;
};