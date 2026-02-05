import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { CalendarDays, Eye, UserCog2, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiGetNoticeById, apiDeleteNotice, apiIncreaseView } from "@/api/noticeApi"; // API 함수 가정
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner"
import { CommentForm } from "@/components/Marketing/Notices/CommentForm";
import { CommentList } from "@/components/Marketing/Notices/CommentList";
import { apiGetComments, type CommentResponse } from "@/api/commentApi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export interface NoticeDetail {
    id: number;
    title: string;
    content: string;
    author: string;
    imageUrl?: string;
    views: number;
    createdAt: string;
}


const NoticeDetailPage = () => {
    const { id: stringId } = useParams<{ id: string }>();
    const noticeId = Number(stringId);
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const [notice, setNotice] = useState<NoticeDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState<CommentResponse[]>([]);

    useEffect(() => {
        if (!stringId || isNaN(noticeId)) {
            alert("유효하지 않은 게시글 번호입니다.");
            navigate("/notice");
            return;
        }
        const fetchNotice = async () => {
            try {
                setLoading(true);
                const data = await apiGetNoticeById(noticeId);
                setNotice(data);
                handleIncrementViews(noticeId);
            } catch (error) {
                console.error("공지사항 로드 실패", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNotice();
        fetchComments();
    }, [noticeId, navigate]);

    const fetchComments = async () => {
        if (!noticeId) return;
        try {
            const data = await apiGetComments(noticeId);
            setComments(data);
        } catch (error) {
            console.error("댓글 로딩 실패", error);
        }
    };

    const handleIncrementViews = async (noticeId: number) => {
        const lastViewed = localStorage.getItem(`viewed_time_${noticeId}`);
        const now = Date.now();
        const ONE_DAY = 24 * 60 * 60 * 1000;

        if (!lastViewed || now - parseInt(lastViewed) > ONE_DAY) {
            await apiIncreaseView(noticeId);
            localStorage.setItem(`viewed_time_${noticeId}`, now.toString());
            setNotice((prev) => (prev ? { ...prev, views: (prev.views || 0) + 1 } : prev));
        }
    };

    const handleDeleteNotice = async (noticeId: number) => {
        try {
            const response = await apiDeleteNotice(noticeId);
            if (response.status === 200 || response.status === 204) {
                toast.success("공지사항이 성공적으로 삭제되었습니다.");
                navigate("/notice");
            }
        } catch (error) {
            console.error("공지사항 삭제 실패", error);
            alert("삭제 권한이 없거나 오류가 발생했습니다.");
        }
    }

    if (loading) return (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>
    );

    if (!notice) return <div className="text-center py-20">공지사항을 찾을 수 없습니다.</div>;

    return (
        <div className="px-3 md:px-12 min-h-full flex justify-center py-10">
            <div className="w-full max-w-8xl">
                <nav className="flex gap-2 mb-4 text-sm md:text-base text-slate-600 dark:text-slate-50">
                    <Link to="/" className="hover:text-primary">홈</Link>
                    <span>&gt;</span>
                    <Link to="/notice" className="hover:text-primary">공지사항</Link>
                </nav>

                <h1 className="text-2xl md:text-4xl font-bold mb-6 break-all leading-tight">
                    {notice.title}
                </h1>

                <div className="flex flex-wrap gap-4 text-sm md:text-base mb-8 pb-6 border-b text-muted-foreground">
                    <div className="flex gap-2 items-center"><UserCog2 size={18} />관리자</div>
                    <div className="flex gap-2 items-center"><CalendarDays size={18} />{formatDate(notice.createdAt)}</div>
                    <div className="flex gap-2 items-center"><Eye size={18} />{notice.views ?? 0} 조회</div>
                </div>

                <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-200 leading-relaxed wrap-break-word mb-12">
                    {notice.imageUrl && (
                        <div className="not-prose mb-10 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
                            <img
                                src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}${notice.imageUrl}`}
                                alt="공지사항 이미지"
                                className="w-full h-auto object-contain max-h-150 bg-slate-50 dark:bg-slate-900"
                            />
                        </div>
                    )}
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {notice.content}
                    </ReactMarkdown>
                </div>

                <div className="mt-12 pt-6 border-t flex justify-between">
                    <Button variant="outline" onClick={() => navigate("/notice")}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> 목록으로
                    </Button>

                    {user?.role === "ROLE_ADMIN" && (
                        <div className="text-right my-2">
                            {/* <Link key={notice._id}
                            href={{
                                pathname: '/noticeEditPage',
                                query: { notice: JSON.stringify(notice) },
                        }} */}
                            <Link to="/notice"
                            ><Button variant="outline" className="mr-2">수정</Button></Link>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button>삭제</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>글을 삭제하시겠습니까?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            삭제된 글은 복구되지 않습니다. 신중하게 생각하고 삭제해주세요.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>취소</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteNotice(noticeId)}>삭제</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}
                </div>
                <div className="text-2xl font-bold my-2 box-content">댓글</div>
                <CommentForm
                    noticeId={noticeId}
                    onCommentAdded={fetchComments}
                />
                <CommentList
                    comments={comments}
                    onRefresh={fetchComments}
                />
            </div>
        </div>
    );
};

export default NoticeDetailPage;