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


// 워크스페이스 가져오기
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

// 워크스페이스 이름 변경
export const apiUpdateWorkspace = async (inviteCode: string, name: string): Promise<WorkspaceResponse> => {
    const response = await axiosAuthInstance.patch(`/workspaces/${inviteCode}`, { name });
    return response.data;
};

// 워크스페이스 삭제
export const apiDeleteWorkspace = async (inviteCode: string): Promise<void> => {
    await axiosAuthInstance.delete(`/workspaces/${inviteCode}`);
};

// 워크스페이스 참여 요청 추가
export const apiJoinWorkspace = async (inviteCode: string): Promise<{ status: string; workspaceId: number }> => {
    const response = await axiosAuthInstance.post('/workspaces/join', { inviteCode });
    return response.data;
};

export const apiGetWorkspaceMembers = async (workspaceCode: string): Promise<WorkspaceMemberResponse[]> => {
    const response = await axiosAuthInstance.get(`/workspaces/${workspaceCode}/members`);
    return response.data;
};

// 워크스페이스 멤버 권한 변경
export const apiUpdateMemberRole = async (workspaceId: number, targetUserId: number, role: 'OWNER' | 'EDITOR' | 'VIEWER'): Promise<void> => {
    await axiosAuthInstance.patch(`/workspaces/${workspaceId}/members/${targetUserId}/role`, { role });
};
