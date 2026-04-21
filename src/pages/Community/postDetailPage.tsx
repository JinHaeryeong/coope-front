import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Loader2, ArrowLeft, PenBox, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { communityApi } from "@/features/community/api/communityApi";
import type { PostDetailResponse } from "@/features/community/types/posts";
import { PostDetailView } from "@/features/community/components/PostDetailView";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

const PostDetailPage = () => {
    const { id: stringId } = useParams<{ id: string }>();
    const postId = Number(stringId);
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const [post, setPost] = useState<PostDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);
                const data = await communityApi.getPostDetail(postId);
                setPost(data);
                handleIncreaseView(postId);

            } catch (error) {
                toast.error("게시글 로드 실패");
                navigate("/community");
            } finally {
                setLoading(false);
            }
        };
        fetchPost();

        // TODO: fetchComments() 호출 로직 추가하기
    }, [postId, navigate]);

    const handleIncreaseView = async (id: number) => {
        const VIEW_KEY = `viewed_post_${id}`;
        const lastViewTime = localStorage.getItem(VIEW_KEY);
        const now = Date.now();
        const ONE_DAY = 24 * 60 * 60 * 1000; // 24시간

        if (!lastViewTime || now - parseInt(lastViewTime) > ONE_DAY) {
            try {
                await communityApi.increaseView(id); // POST /api/community/posts/{id}/views
                localStorage.setItem(VIEW_KEY, now.toString());

                setPost(prev => prev ? { ...prev, viewCount: prev.viewCount } : null);
            } catch (error) {
                console.error("조회수 증가 처리 중 오류:", error);
            }
        }
    };

    const handleDeletePost = async () => {
        try {
            const deletePromise = communityApi.deletePost(postId);

            toast.promise(deletePromise, {
                loading: '게시글을 삭제 중입니다...',
                success: '게시글이 삭제되었습니다.',
                error: (err) => {
                    if (err.response?.status === 403) return "삭제 권한이 없습니다.";
                    return "삭제 처리 중 오류가 발생했습니다.";
                },
            });

            await deletePromise;

            navigate("/community", { replace: true });

        } catch (error) {
            console.error("삭제 실패:", error);
        }
    };

    if (loading) return <div className="flex justify-center py-40"><Loader2 className="animate-spin" /></div>;
    if (!post) return null;

    const isAuthor = user?.nickname === post.authorNickname;

    return (
        <div className="px-4 md:px-12 py-10 flex justify-center">
            <div className="w-full max-w-8xl">
                <PostDetailView post={post} />

                <div className="flex justify-between items-center pt-8 border-t">
                    <Button variant="outline" onClick={() => navigate("/community")}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> 목록으로
                    </Button>

                    {isAuthor && (
                        <div className="flex gap-2">
                            <Link to={`/community/edit/${post.id}`}>
                                <Button variant="outline"><PenBox size={14} /> 수정</Button>
                            </Link>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button><Trash2 size={14} /> 삭제</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>삭제하시겠습니까?</AlertDialogTitle>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>취소</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeletePost}>삭제</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}
                </div>

                // TODO: CommentForm, CommentList 컴포넌트 여기 배치하기
                <div className="flex items-center gap-2 text-xl font-bold mt-6">
                    댓글 <span className="text-blue-600">{post.comments?.length || 0}</span>
                </div>
            </div>


        </div>
    );
};

export default PostDetailPage;