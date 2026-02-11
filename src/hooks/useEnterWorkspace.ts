import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { apiGetMyWorkspaces, apiCreateWorkspace } from "@/api/workspaceApi";

export const useEnterWorkspace = () => {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const [isLoading, setIsLoading] = useState(false);

    const onEnter = useCallback(async () => {
        if (!user) {
            toast.error("로그인이 필요합니다.");
            return;
        }

        setIsLoading(true);
        try {
            const workspaces = await apiGetMyWorkspaces();

            if (workspaces && workspaces.length > 0) {
                const firstWorkspace = workspaces[0];
                navigate(`/workspace/${firstWorkspace.inviteCode}`);
            } else {
                const newWorkspaceName = `${user.nickname}의 워크스페이스`;
                const newWorkspace = await apiCreateWorkspace(newWorkspaceName);

                toast.success("워크스페이스가 준비되었습니다!");
                navigate(`/workspace/${newWorkspace.inviteCode}`);
            }
        } catch (error) {
            console.error("Workspace entry error:", error);
            toast.error("워크스페이스 정보를 확인할 수 없습니다.");
        } finally {
            setIsLoading(false);
        }
    }, [user, navigate]);

    return {
        onEnter,
        isLoading,
        user
    };
};