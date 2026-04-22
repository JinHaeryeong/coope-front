import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostForm } from "@/features/community/components/PostForm";
import { communityApi } from "@/features/community/api/communityApi";
import { toast } from "sonner";
import type { PostCreateRequest } from "@/features/community/types/posts";

const PostWritePage = () => {
    const navigate = useNavigate();

    const handleSubmit = async (formData: PostCreateRequest) => {
        try {
            let cleanTechStack = formData.techStack;

            if (cleanTechStack) {
                cleanTechStack = cleanTechStack
                    .split(',')               // 1) 쉼표 기준으로 자르고
                    .map(s => s.trim())       // 2) 양쪽 끝 공백 제거 (Trim)
                    .filter(s => s !== "")    // 3) 빈 문자열 제거 (실수로 ,, 입력한 경우 방지)
                    .join(',');               // 4) 다시 쉼표로 합치기
            }

            const requestData = {
                ...formData,
                techStack: cleanTechStack, // 정제된 데이터 주입
                targetMembers: formData.targetMembers ? Number(formData.targetMembers) : undefined,
                currentMembers: 1,
            };

            await communityApi.createPost(requestData);
            toast.success("게시글이 등록되었습니다.");
            navigate("/community", { replace: true });
        } catch (error) {
            toast.error("등록에 실패했습니다.");
            console.error(error);
        }
    };

    return (
        <div className="container mx-auto py-10 md:px-4 max-w-4xl">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">게시글 작성</h1>
            </div>

            <PostForm onSubmit={handleSubmit} />
        </div>
    );
};

export default PostWritePage;