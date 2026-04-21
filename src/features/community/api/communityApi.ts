import axiosAuthInstance from "@/api/axiosAuthInstance";
import axiosInstance from "@/api/axiosInstance";
import type {
    PostCategory,
    PostResponse,
    PageResponse,
    PostCreateRequest,
    PostUpdateRequest
} from "../types/posts";

const BASE_URL = "/community/posts";

export const communityApi = {
    getPosts: async (page: number, size: number, category?: PostCategory | "all") => {
        const response = await axiosInstance.get<PageResponse<PostResponse>>(BASE_URL, {
            params: {
                category: category === "all" ? undefined : category,
                page,
                size,
                sort: "id,desc",
            },
        });
        return response.data;
    },

    getPostDetail: async (id: number) => {
        const response = await axiosAuthInstance.get(`${BASE_URL}/${id}`);
        return response.data;
    },

    createPost: async (data: PostCreateRequest) => {
        const response = await axiosAuthInstance.post(BASE_URL, data);
        return response;
    },

    updatePost: async (id: number, data: PostUpdateRequest) => {
        const response = await axiosAuthInstance.put(`${BASE_URL}/${id}`, data);
        return response;
    },
    deletePost: async (id: number) => {
        const response = await axiosAuthInstance.delete(`${BASE_URL}/${id}`);
        return response;
    },

    increaseView: async (id: number) => {
        const response = await axiosInstance.post(`${BASE_URL}/${id}/views`);
        return response;
    },

    searchPosts: async (keyword: string, category?: PostCategory, page = 0, size = 20) => {
        const response = await axiosInstance.get<PageResponse<PostResponse>>(`${BASE_URL}/search`, {
            params: { keyword, category, page, size },
        });
        return response.data;
    }
};