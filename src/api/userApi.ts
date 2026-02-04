import axiosInstance from './axiosInstance';
export const apiSignUp = async (signUser: any) => {
    const response = await axiosInstance.post("/auth/signup", signUser);
    return response.data;
}