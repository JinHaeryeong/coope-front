import axiosAuthInstance from "./axiosAuthInsatance";


export const apiInquiries = async (page: number) => {
    const response = await axiosAuthInstance.get(`/api/inquiries?page=${page}&size=10`);
    return response.data;
}