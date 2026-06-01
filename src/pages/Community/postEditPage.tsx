import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { communityApi } from "@/features/community/api/communityApi";
import { PostForm } from "@/features/community/components/PostForm";
import type { PostCreateRequest, PostUpdateRequest } from "@/features/community/types/posts";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

const PostEditPage = () => {
    const { id: stringId } = useParams<{ id: string }>();
    const postId = Number(stringId);
    const navigate = useNavigate();
    const { user, isLoggedIn } = useAuthStore();

    const [initialData, setInitialData] = useState<PostCreateRequest | null>(null);
    const [loading, setLoading] = useState(true);

    // 수정할 기존 데이터 가져오기
    useEffect(() => {
        if (!isLoggedIn) {
            toast.error("로그인이 필요합니다.");
            navigate("/community", { replace: true });
            return;
        }
        const fetchPostDetail = async () => {
            try {
                setLoading(true);
                const data = await communityApi.getPostDetail(postId);

                if (user?.nickname !== data.authorNickname) {
                    toast.error("해당 게시글의 수정 권한이 없습니다.");
                    navigate(`/community/${postId}`, { replace: true }); // 원래 상세페이지로 튕기기
                    return;
                }

                setInitialData({
                    category: data.category,
                    title: data.title,
                    content: data.content,
                    targetMembers: data.targetMembers || 2,
                    techStacks: data.techStacks || [],
                });
            } catch (error) {
                toast.error("수정할 게시글 데이터를 불러오지 못했습니다.");
                navigate(`/community/${postId}`);
            } finally {
                setLoading(false);
            }
        };

        if (postId) fetchPostDetail();
    }, [postId, navigate]);

    // 수정 완료 버튼 눌렀을 때 PUT 요청 핸들러
    const handleUpdateSubmit = async (formData: PostCreateRequest) => {
        try {
            const { category, ...updateData } = formData;

            const requestBody = {
                ...updateData,
                currentMembers: formData.currentMembers || 1
            };

            await communityApi.updatePost(postId, requestBody as PostUpdateRequest);

            toast.success("게시글이 성공적으로 수정되었습니다.");
            navigate(`/community/${postId}`, { replace: true }); // 수정 후 다시 상세페이지로 이동
        } catch (error) {
            toast.error("게시글 수정에 실패했습니다.");
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-40">
                <Loader2 className="animate-spin" />
            </div>
        );
    }

    if (!initialData) return null;

    return (
        <div className="px-4 md:px-12 py-10">
            <div className="max-w-4xl mx-auto mb-6">
                <h2 className="text-xl md:text-2xl font-bold">게시글 수정</h2>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                    게시글의 내용을 수정하고 저장해 주세요.
                </p>
            </div>

            <PostForm onSubmit={handleUpdateSubmit} initialData={initialData} isEdit={true} />
        </div>
    );
};

export default PostEditPage;