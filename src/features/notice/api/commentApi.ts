import axiosAuthInstance from "@/api/axiosAuthInstance";
import axiosInstance from "@/api/axiosInstance";

export interface CommentResponse {
    id: number;
    content: string;
    author: string;
    userId: number;
    authorImgUrl?: string;
    imageUrl?: string;
    createdAt: string;
}

// 댓글 추가
export const apiAddComment = async (noticeId: number, formData: FormData) => {
    const response = await axiosAuthInstance.post(
        `/notices/${noticeId}/comments`,
        formData
    );
    return response;
};

// 댓글 목록 조회
export const apiGetComments = async (noticeId: number): Promise<CommentResponse[]> => {
    const response = await axiosInstance.get(`/notices/${noticeId}/comments`);
    return response.data;
}

// 댓글 삭제
export const apiDeleteComment = async (noticeId: number, commentId: number) => {
    const response = await axiosAuthInstance.delete(`/notices/${noticeId}/comments/${commentId}`);
    return response;
};

// 댓글 수정
export const apiEditComment = async (noticeId: number, commentId: number, formData: FormData) => {
    const response = await axiosAuthInstance.patch(
        `/notices/${noticeId}/comments/${commentId}`,
        formData
    );
    return response;
};
