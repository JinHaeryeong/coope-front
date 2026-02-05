import axiosAuthInstance from "./axiosAuthInsatance";
import axiosInstance from "./axiosInstance";

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
        `/comments?noticeId=${noticeId}`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );
    return response;
};

// 댓글 목록
export const apiGetComments = async (id: number): Promise<CommentResponse[]> => {
    const response = await axiosInstance.get(`/comments?noticeId=${id}`);
    return response.data;
}

// 댓글 삭제
export const apiDeleteComment = async (id: number) => {
    const response = await axiosAuthInstance.delete(`/comments/${id}`);
    return response;
};

// 댓글 수정
export const apiEditComment = async (id: number, data: { content: string }) => {
    const response = await axiosAuthInstance.patch(`/comments/${id}`, data);
    return response;
};