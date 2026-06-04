import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PostForm } from "@/features/community/components/PostForm";
import { communityApi } from "@/features/community/api/communityApi";
import { toast } from "sonner";
import type { PostCreateRequest } from "@/features/community/types/posts";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useEffect } from "react";

const PostWritePage = () => {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuthStore();

    useEffect(() => {
        if (!isLoggedIn) {
            toast.error("로그인이 필요한 서비스입니다.");
            navigate("/community", { replace: true });
        }
    }, [isLoggedIn, navigate]);

    const handleSubmit = async (formData: PostCreateRequest) => {
        try {

            const requestData = {
                ...formData,
                targetMembers: formData.targetMembers != null ? Number(formData.targetMembers) : undefined,
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