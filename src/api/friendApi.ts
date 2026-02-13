import axiosAuthInstance from "./axiosAuthInstance";

export type FriendStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface FriendResponse {
    id: number;
    friendId: number;
    nickname: string;
    userIcon: string;
    status: FriendStatus;
}



/**
 * 친구 목록 조회
 * @param status 필터링할 상태 (ACCEPTED, PENDING 등)
 */
export const apiGetFriends = async (status?: FriendStatus) => {
    const response = await axiosAuthInstance.get<FriendResponse[]>("/friends", {
        params: { status } // /api/friends?status=ACCEPTED
    });
    return response.data;
};

export const apiGetReceivedRequests = async (): Promise<FriendResponse[]> => {
    const response = await axiosAuthInstance.get<FriendResponse[]>("/friends/requests/received");
    return response.data;
};

export const apiSearchUser = async (nickname: string) => {
    const response = await axiosAuthInstance.get<FriendResponse>(`/user/search`, {
        params: { nickname }
    });
    return response.data;
};


// 친구 요청 수락
export const apiAcceptFriend = async (friendId: number) => {
    const response = await axiosAuthInstance.post(`/friends/accept`, null, {
        params: { friendId }
    });
    return response.data;
};


// 친구 요청 거절 또는 친구 삭제
export const apiDeleteFriend = async (friendId: number) => {
    const response = await axiosAuthInstance.delete(`/friends`, {
        params: { friendId }
    });
    return response.data;
};
