import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { apiDeleteComment, apiEditComment } from "@/api/commentApi";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";


const API_HOST = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export interface Comment {
    id: number;
    content: string;
    author: string;
    userId: number;
    authorImgUrl?: string;
    imageUrl?: string;
    createdAt: string;
}

interface CommentListProps {
    comments: Comment[];
    onRefresh: () => void;
}

export const CommentList = ({ comments, onRefresh }: CommentListProps) => {
    const { user } = useAuthStore();
    const [commentEdit, setCommentEdit] = useState("");
    const [commentIdToEdit, setCommentIdToEdit] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 삭제 핸들러
    const handleDelete = async (id: number) => {
        try {
            await apiDeleteComment(id);
            toast.success("댓글이 삭제되었습니다.");
            onRefresh(); // 부모의 fetchComments 실행
        } catch (error) {
            console.error("댓글 삭제 중 오류 발생", error);
            toast.error("삭제 권한이 없거나 오류가 발생했습니다.");
        }
    };

    // 수정 버튼 클릭 시 셋팅
    const handleEditButtonClick = (id: number, content: string) => {
        setCommentIdToEdit(id);
        setCommentEdit(content);
    };

    // 수정 제출 핸들러
    const handleCommentEdit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!commentIdToEdit) return;

        try {
            setIsSubmitting(true);
            await apiEditComment(commentIdToEdit, { content: commentEdit });
            toast.success("댓글이 수정되었습니다.");
            setCommentIdToEdit(null);
            onRefresh();
        } catch (error) {
            console.error("댓글 수정 중 오류 발생", error);
            toast.error("수정 실패");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!comments) return <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6 mt-8">
            {comments.length === 0 ? (
                <p className="text-center text-muted-foreground py-10">첫 댓글을 남겨보세요!</p>
            ) : (
                comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4 items-start box-border">
                        <Avatar className="w-10 h-10">
                            <AvatarImage src={comment.authorImgUrl} alt="프로필" />
                            <AvatarFallback>{comment.author?.charAt(0)}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0 bg-slate-50 dark:bg-gray-800 p-4 rounded-lg border">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm">{comment.author}</span>
                                    <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
                                </div>

                                {comment.userId === user?.id && (
                                    <div className="flex gap-1">
                                        <Button variant="ghost" className="h-7 px-2 text-xs" onClick={() => handleEditButtonClick(comment.id, comment.content)}>수정</Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" className="h-7 px-2 text-xs text-destructive">삭제</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>댓글 삭제</AlertDialogTitle>
                                                    <AlertDialogDescription>삭제된 댓글은 복구되지 않습니다.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>취소</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(comment.id)} className="bg-destructive text-white">삭제</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                )}
                            </div>

                            <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                {comment.content}
                            </div>

                            {comment.imageUrl && (
                                <div className="mt-3">
                                    <img
                                        src={`${API_HOST}${comment.imageUrl}`}
                                        alt="첨부 이미지"
                                        className="max-w-full md:max-w-xs rounded-md border cursor-zoom-in"
                                        onClick={() => window.open(`${API_HOST}${comment.imageUrl}`)}
                                    />
                                </div>
                            )}

                            {commentIdToEdit === comment.id && (
                                <form onSubmit={handleCommentEdit} className="mt-4 space-y-2">
                                    <textarea
                                        value={commentEdit}
                                        onChange={(e) => setCommentEdit(e.target.value)}
                                        className="w-full min-h-20 p-2 text-sm border rounded-md  focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                                        maxLength={200}
                                        required
                                    />
                                    <div className="flex justify-end gap-2">
                                        <Button type="button" variant="outline" size="sm" onClick={() => setCommentIdToEdit(null)}>취소</Button>
                                        <Button type="submit" size="sm" disabled={isSubmitting}>수정완료</Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};