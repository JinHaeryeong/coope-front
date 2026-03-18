import axiosAuthInstance from "@/api/axiosAuthInstance";

// 내 문의 내역 페이징 조회
export const apiGetMyInquiries = async (page: number, size: number = 10) => {
    const response = await axiosAuthInstance.get('/inquiries/me', {
        params: {
            page,
            size,
            sort: 'createdAt,desc'
        }
    });
    return response.data;
};

// 관리자 조회
export const apiGetAllInquiries = async (page: number, size: number = 10) => {
    const response = await axiosAuthInstance.get('/inquiries', {
        params: {
            page,
            size,
            sort: 'createdAt,desc'
        }
    });
    return response.data;
};

// 문의사항 등록
export const apiCreateInquiry = async (formData: FormData) => {
    const response = await axiosAuthInstance.post('/inquiries', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// 문의사항 상세페이지
export const apiGetInquiryById = async (id: number) => {
    const response = await axiosAuthInstance.get(`/inquiries/${id}`);
    return response.data;
};

// 문의 삭제
export const apiDeleteInquiry = async (id: number) => {
    const response = await axiosAuthInstance.delete(`/inquiries/${id}`);
    return response;
};

// 문의 답변
export const apiCreateInquiryAnswer = async (inquiryId: number, content: string) => {
    const response = await axiosAuthInstance.post(`/inquiries/${inquiryId}/answers`, {
        content: content
    });
    return response.data;
};
