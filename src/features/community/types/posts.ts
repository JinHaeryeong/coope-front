export type PostCategory = "RECRUITMENT" | "SHOWCASE" | "QNA" | "GENERAL";

export interface PageResponse<T> {
    content: T[];
    page: {
        size: number;
        number: number;
        totalElements: number;
        totalPages: number;
    };
}

// 게시글 목록/상세 응답
export interface PostResponse {
    id: number;
    category: PostCategory;
    title: string;
    authorNickname: string;
    authorIcon: string;
    viewCount: number;
    commentCount: number;
    createdAt: string;

    // 모집 카드 전용 필드
    techStack?: string;
    currentMembers?: number;
    targetMembers?: number;
}

export interface PostCreateRequest {
    category: PostCategory;
    title: string;
    content: string;
    techStack?: string;
    currentMembers?: number;
    targetMembers?: number;
}

export interface PostUpdateRequest {
    title: string;
    content: string;
    techStack?: string;
    currentMembers?: number;
    targetMembers?: number;
}

export interface PostDetailResponse {
    id: number;
    category: PostCategory;
    title: string;
    content: string;
    authorNickname: string;
    authorIcon: string;
    viewCount: number;
    createdAt: string;

    // 모집 전용 필드
    techStack?: string;
    currentMembers?: number;
    targetMembers?: number;

    comments: any[];
}