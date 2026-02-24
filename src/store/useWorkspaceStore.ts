import { create } from 'zustand';
import { apiGetMyWorkspaces, type WorkspaceResponse } from "@/api/workspaceApi";

interface WorkspaceState {
    workspaces: WorkspaceResponse[];
    isLoading: boolean;
    fetchWorkspaces: () => Promise<void>;
    addWorkspace: (workspace: WorkspaceResponse) => void;
    updateWorkspaceName: (inviteCode: string, newName: string) => void;
    deleteWorkspaceFromStore: (inviteCode: string) => void;
}

// 제네릭을 사용하여 스토어 생성
export const useWorkspaceStore = create<WorkspaceState>((set) => ({
    workspaces: [],
    isLoading: false,

    // 서버에서 목록 가져오기
    fetchWorkspaces: async () => {
        set({ isLoading: true });
        try {
            const data = await apiGetMyWorkspaces();
            set({ workspaces: data });
        } catch (error) {
            console.error("워크스페이스 로딩 실패:", error);
        } finally {
            set({ isLoading: false });
        }
    },

    addWorkspace: (workspace) =>
        set((state) => ({
            workspaces: [...state.workspaces, workspace]
        })),
    // 스토어 내의 특정 워크스페이스 이름 즉시 업데이트 (낙관적 업데이트용)
    updateWorkspaceName: (inviteCode, newName) =>
        set((state) => ({
            workspaces: state.workspaces.map((w) =>
                w.inviteCode === inviteCode ? { ...w, name: newName } : w
            )
        })),

    // 삭제 시 스토어에서도 즉시 제거
    deleteWorkspaceFromStore: (inviteCode) =>
        set((state) => ({
            workspaces: state.workspaces.filter((w) => w.inviteCode !== inviteCode)
        })),
}));