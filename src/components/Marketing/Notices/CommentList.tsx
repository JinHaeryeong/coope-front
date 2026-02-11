import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { apiDeleteComment, apiEditComment } from "@/api/commentApi";
import { toast } from "sonner";
import { ImagePlus, Loader2, X } from "lucide-react";



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
    const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null);
    const [editFile, setEditFile] = useState<File | null>(null);
    const [commentIdToEdit, setCommentIdToEdit] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isImageDeletedFlag, setIsImageDeletedFlag] = useState(false);

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
        setIsImageDeletedFlag(false);
        removeEditFile();
    };

    // 수정 제출 핸들러
    const handleCommentEdit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!commentIdToEdit) return;

        try {
            setIsSubmitting(true);
            const formData = new FormData();
            formData.append("content", commentEdit);
            formData.append("deleteImage", String(isImageDeletedFlag));
            if (editFile) {
                formData.append("file", editFile);
            }

            await apiEditComment(commentIdToEdit, formData);
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

    const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (selectedFile.size > 1 * 1024 * 1024) {
            toast.error("1MB 이하의 이미지만 가능합니다.");
            return;
        }

        if (editPreviewUrl) {
            URL.revokeObjectURL(editPreviewUrl);
        }

        setEditFile(selectedFile);
        setEditPreviewUrl(URL.createObjectURL(selectedFile));
    };

    // 선택한 파일 취소
    const removeEditFile = () => {
        setEditFile(null);
        if (editPreviewUrl) URL.revokeObjectURL(editPreviewUrl);
        setEditPreviewUrl(null);
    };


    const handleImageIconClick = (comment: Comment) => {
        if (comment.imageUrl && !isImageDeletedFlag) {
            toast.error("기존 이미지를 삭제해야 새 이미지를 올릴 수 있습니다.");
            return;
        }
        document.getElementById(`edit-file-${comment.id}`)?.click();
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
                                <div className="flex flex-col sm:flex-row sm:items-center gap-x-2 gap-y-0.5 mb-2 overflow-hidden">
                                    <span className="font-bold text-sm truncate max-w-30 md:max-w-50" title={comment.author}>
                                        {comment.author}
                                    </span>
                                    <span className="text-[10px] md:text-xs text-muted-foreground shrink-0">
                                        {formatDate(comment.createdAt)}
                                    </span>
                                </div>

                                {comment.userId === user?.id && (
                                    <div className="flex gap-1">
                                        <Button variant="ghost" className="h-7 px-2 text-xs cursor-pointer" onClick={() => handleEditButtonClick(comment.id, comment.content)}>수정</Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" className="h-7 px-2 text-xs text-destructive cursor-pointer">삭제</Button>
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

                            <div className="text-sm leading-relaxed whitespace-pre-wrap break-all">
                                {comment.content}
                            </div>

                            {comment.imageUrl && (
                                <div className="mt-3">
                                    <img
                                        src={comment.imageUrl}
                                        alt="첨부 이미지"
                                        className="w-auto h-auto max-w-44 md:max-w-sm aspect-auto object-contain rounded-md border shadow-sm cursor-zoom-in hover:opacity-95 transition-all"
                                        onClick={() => window.open(comment.imageUrl)}
                                    />
                                </div>
                            )}

                            {commentIdToEdit === comment.id && (
                                <form onSubmit={handleCommentEdit} className="mt-4 md:space-y-3 p-3 bg-white dark:bg-gray-900 rounded-md border-2 border-primary/20">
                                    <textarea
                                        value={commentEdit}
                                        onChange={(e) => setCommentEdit(e.target.value)}
                                        // 모바일(기본)에서는 4줄(min-h-20), PC(min-h-24)에서는 6줄 이상으로 조절
                                        className="w-full min-h-20 md:min-h-24 p-2 text-sm border-none focus:ring-0 resize-none bg-transparent"
                                        placeholder="수정할 내용을 입력하세요..."
                                        required
                                    />

                                    <div className="flex gap-2 mb-2">
                                        {comment.imageUrl && !isImageDeletedFlag && !editPreviewUrl && (
                                            <div className="relative w-20 h-20 border rounded-md overflow-hidden opacity-80">
                                                <img src={comment.imageUrl} alt="기존 이미지" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsImageDeletedFlag(true)}
                                                        className="absolute top-0 right-0 bg-destructive text-white p-0.5 rounded-bl-md hover:bg-destructive/90 transition-colors cursor-pointer"
                                                        title="기존 이미지 삭제"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {editPreviewUrl && (
                                            <div className="relative w-20 h-20 border-2 border-primary rounded-md overflow-hidden">
                                                <img src={editPreviewUrl} alt="새 이미지" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={removeEditFile}
                                                    className="absolute top-0 right-0 bg-destructive text-white p-0.5 rounded-bl-md"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-center border-t pt-2">
                                        <div className="flex items-center">
                                            <input
                                                type="file"
                                                id={`edit-file-${comment.id}`}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleEditFileChange}
                                            />
                                            <button
                                                type="button" // form 전송 방지
                                                onClick={() => handleImageIconClick(comment)}
                                                className={`p-2 rounded-full transition-colors ${comment.imageUrl && !isImageDeletedFlag
                                                    ? "text-gray-300 cursor-not-allowed" // 비활성화된 느낌의 색상
                                                    : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-gray-700 hover:text-primary"
                                                    }`}
                                            >
                                                <ImagePlus size={20} />
                                            </button>
                                            {editFile && <span className="text-[10px] text-primary ml-1">새 이미지 선택됨</span>}
                                        </div>

                                        <div className="flex gap-2">
                                            <Button type="button" variant="ghost" size="sm" className="cursor-pointer" onClick={() => setCommentIdToEdit(null)}>취소</Button>
                                            <Button type="submit" size="sm" disabled={isSubmitting} className="cursor-pointer">
                                                {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                                                수정완료
                                            </Button>
                                        </div>
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