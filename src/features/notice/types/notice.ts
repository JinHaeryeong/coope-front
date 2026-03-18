export interface Notice {
    id: number;
    title: string;
    author: string;
    views: number;
    createdAt: string;
}

export interface NoticeDetail {
    id: number;
    title: string;
    content: string;
    author: string;
    imageUrl?: string;
    views: number;
    createdAt: string;
}

export interface Comment {
    id: number;
    content: string;
    author: string;
    userId: number;
    authorImgUrl?: string;
    imageUrl?: string;
    createdAt: string;
}
