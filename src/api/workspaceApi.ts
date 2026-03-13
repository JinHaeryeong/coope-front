import axiosAuthInstance from "./axiosAuthInstance";

export interface WorkspaceResponse {
    id: number;
    name: string;
    role: 'OWNER' | 'EDITOR' | 'VIEWER';
    inviteCode: string;
}

export interface WorkspaceMemberResponse {
    userId: number;
    nickname: string;
    role: 'OWNER' | 'EDITOR' | 'VIEWER';
}


export const apiGetMyWorkspaces = async (): Promise<WorkspaceResponse[]> => {
    const response = await axiosAuthInstance.get('/workspaces');
    return response.data;
};

export const apiCreateWorkspace = async (name: string): Promise<WorkspaceResponse> => {
    const response = await axiosAuthInstance.post('/workspaces', { name });
    return response.data;
};

export const apiGetWorkspaceByCode = async (inviteCode: string): Promise<WorkspaceResponse> => {
    const response = await axiosAuthInstance.get(`/workspaces/${inviteCode}`);
    return response.data;
};

export const apiUpdateWorkspace = async (workspaceCode: string, name: string): Promise<WorkspaceResponse> => {
    const response = await axiosAuthInstance.patch(`/workspaces/${workspaceCode}`, { name });
    return response.data;
};

export const apiDeleteWorkspace = async (inviteCode: string): Promise<void> => {
    await axiosAuthInstance.delete(`/workspaces/${inviteCode}`);
};

export const apiJoinWorkspace = async (inviteCode: string): Promise<{ status: string; workspaceId: number }> => {
    const response = await axiosAuthInstance.post('/workspaces/join', { inviteCode });
    return response.data;
};

export const apiGetWorkspaceMembers = async (workspaceCode: string): Promise<WorkspaceMemberResponse[]> => {
    const response = await axiosAuthInstance.get(`/workspaces/${workspaceCode}/members`);
    return response.data;
};

export const apiUpdateMemberRole = async (
    workspaceCode: string,
    targetUserId: number,
    role: 'OWNER' | 'EDITOR' | 'VIEWER'
): Promise<void> => {
    await axiosAuthInstance.patch(`/workspaces/${workspaceCode}/members/${targetUserId}/role`, { role });
};