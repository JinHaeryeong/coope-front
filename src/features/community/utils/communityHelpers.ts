import { type Category } from "../types/post";

export const getCategoryStyle = (category: Category) => {
    switch (category) {
        case "RECRUITMENT":
            return "bg-green-50 text-green-700 border-green-200 hover:bg-green-50";
        case "SHOWCASE":
            return "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-50";
        case "QNA":
            return "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-50";
        case "GENERAL":
            return "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-50";
        default:
            return "bg-slate-50 text-slate-700 border-slate-200";
    }
};

export const getCategoryLabel = (category: Category) => {
    const labels: Record<Category, string> = {
        RECRUITMENT: "모집",
        SHOWCASE: "자랑",
        QNA: "질문",
        GENERAL: "자유",
    };
    return labels[category] || "기타";
};