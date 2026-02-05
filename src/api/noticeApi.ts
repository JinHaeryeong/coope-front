import axiosAuthInstance from "./axiosAuthInsatance";
import axiosInstance from "./axiosInstance"

// 공지사항 가져오기
export const apiNotices = async (page: number, size: number) => {
    const response = await axiosInstance.get(`/notices/all?page=${page}&size=${size}`);
    return response.data;
}

// 공지사항 상세보기
export const apiGetNoticeById = async (id: number) => {
    const response = await axiosInstance.get(`/notices/detail/${id}`);
    return response.data;
}

// 공지사항 작성

export const apiCreateNotice = async (formData: FormData) => {
    const response = await axiosAuthInstance.post(
        `/notices/write`,
        formData,
    );
    return response;
}


// 공지사항 삭제
export const apiDeleteNotice = async (id: number) => {
    const response = await axiosAuthInstance.delete(`/notices/detail/${id}`);
    return response;
}

// 공지사항 조회수 증가
export const apiIncreaseView = async (id: number) => {
    const response = await axiosInstance.patch(`/notices/detail/views/${id}`);
    return response;
}

