import axiosAuthInstance from "./axiosAuthInstance";

export interface WorkspaceResponse {
    id: number;
    name: string;
    role: 'OWNER' | 'EDITOR' | 'VIEWER';
    inviteCode: string;
}


// 워크스페이스 가져오기
export const apiGetMyWorkspaces = async (): Promise<WorkspaceResponse[]> => {
    const response = await axiosAuthInstance.get('/workspaces');
    return response.data;
};

export const apiCreateWorkspace = async (name: string): Promise<WorkspaceResponse> => {
    const response = await axiosAuthInstance.post('/workspaces', { name });
    return response.data;
};