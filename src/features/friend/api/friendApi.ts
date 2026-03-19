import axiosAuthInstance from "@/api/axiosAuthInstance";
import type { FriendStatus, FriendResponse } from "../types/friend";

// 친구 목록 조회
export const apiGetFriends = async (status: FriendStatus = "ACCEPTED") => {
    const response = await axiosAuthInstance.get<FriendResponse[]>("/friends", {
        params: { status }
    });
    return response.data;
};

// 받은 친구 요청 목록 조회
export const apiGetReceivedRequests = async (): Promise<FriendResponse[]> => {
    const response = await axiosAuthInstance.get<FriendResponse[]>("/friends/received");
    return response.data;
};

// 요청 보내기
export const apiSendFriendRequest = async (friendId: number) => {
    const response = await axiosAuthInstance.post(`/friends/${friendId}`);
    return response.data;
};

//친구 요청 수락
export const apiAcceptFriend = async (friendId: number) => {
    const response = await axiosAuthInstance.patch(`/friends/${friendId}/accept`);
    return response.data;
};

// 친구 삭제
export const apiDeleteFriend = async (friendId: number) => {
    const response = await axiosAuthInstance.delete(`/friends/${friendId}`);
    return response.data;
};
