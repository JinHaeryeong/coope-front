import axiosAuthInstance from "@/api/axiosAuthInstance";
import axiosInstance from "@/api/axiosInstance"

export const apiNotices = async (page: number, size: number) => {
    const response = await axiosInstance.get(`/notices?page=${page}&size=${size}`);
    return response.data;
}

export const apiGetNoticeById = async (id: number) => {
    const response = await axiosInstance.get(`/notices/${id}`);
    return response.data;
}

export const apiCreateNotice = async (formData: FormData) => {
    const response = await axiosAuthInstance.post(
        `/notices`,
        formData,
    );
    return response;
}

export const apiEditNotice = async (id: number, formData: FormData) => {
    const response = await axiosAuthInstance.put(`/notices/${id}`, formData);
    return response;
};

export const apiDeleteNotice = async (id: number) => {
    const response = await axiosAuthInstance.delete(`/notices/${id}`);
    return response;
}

export const apiIncreaseView = async (id: number) => {
    const response = await axiosInstance.patch(`/notices/${id}/views`);
    return response;
}
