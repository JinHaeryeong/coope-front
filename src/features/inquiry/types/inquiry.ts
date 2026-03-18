export interface Inquiry {
    id: number;
    title: string;
    content: string;
    userName?: string;
    category: string;
    environment: string;
    status: "PENDING" | "ANSWERED" | "COMPLETED";
    createdAt: string;
    imageUrls?: string[];
}

export interface InquiryDetail extends Inquiry {
    userId: number;
    answer?: string;
}
