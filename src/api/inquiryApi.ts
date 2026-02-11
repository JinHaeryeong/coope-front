import axiosAuthInstance from "./axiosAuthInstance";


export const apiInquiries = async (page: number) => {
    const response = await axiosAuthInstance.get(`/inquiries?page=${page}&size=10`);
    return response.data;
}