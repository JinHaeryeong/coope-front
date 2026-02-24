import axiosAuthInstance from "./axiosAuthInstance";

export type ImageCategory = "COVER" | "DOCUMENT" | "PROFILE";

export const apiFileUpload = async (file: File, category: ImageCategory) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosAuthInstance.post(`/files/upload/${category}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });

    return response.data;
};