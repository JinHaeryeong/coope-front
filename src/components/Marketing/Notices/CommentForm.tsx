import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { apiAddComment } from "@/api/commentApi";
import { toast } from "sonner";
import { ImagePlus, X } from "lucide-react";

interface CommentFormProps {
    noticeId: number;
    onCommentAdded: () => void;
}

export const CommentForm = ({ noticeId, onCommentAdded }: CommentFormProps) => {
    const [content, setContent] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const { isLoggedIn } = useAuthStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (selectedFile.size > 1 * 1024 * 1024) { // 1MB 제한
            toast.error("파일 크기는 1MB를 초과할 수 없습니다.");
            return;
        }

        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile)); // 미리보기 생성
    };

    const removeFile = () => {
        setFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl); // 메모리 해제
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleComment = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!isLoggedIn) {
            toast.error('로그인이 필요합니다.');
            return;
        }

        if (!content.trim()) {
            toast.error('내용을 입력해주세요.');
            return;
        }

        try {
            setIsSubmitting(true);

            const formData = new FormData();
            formData.append("content", content);
            if (file) {
                formData.append("file", file);
            }

            await apiAddComment(noticeId, formData);

            toast.success('댓글이 등록되었습니다.');
            setContent('');
            removeFile();
            onCommentAdded(); // 목록 새로고침 실행
        } catch (error) {
            console.error('댓글 작성 중 오류 발생', error);
            toast.error('댓글 작성에 실패했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col w-full mt-6"> {/* 가로가 아닌 세로 배치가 미리보기 보기에 편해요 */}
            {/* 미리보기 영역 (위치 고정) */}
            {previewUrl && (
                <div className="relative w-20 h-20 mb-3 ml-1">
                    <img src={previewUrl} alt="preview" className="w-full h-full object-cover rounded-md border shadow-sm" />
                    <button
                        onClick={removeFile}
                        className="absolute -top-2 -right-2 bg-primary text-white rounded-full p-1 shadow-md hover:bg-destructive/90"
                    >
                        <X size={12} />
                    </button>
                </div>
            )}

            <form onSubmit={handleComment} className="flex gap-2 w-full h-24">
                <div className="relative flex-1 h-full">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={isLoggedIn ? "댓글을 입력해주세요 (최대 200자)" : "로그인 후 이용 가능합니다."}
                        disabled={!isLoggedIn || isSubmitting}
                        required
                        className="w-full h-full p-3 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none pr-10" // 우측 패딩 추가
                        maxLength={200}
                    />

                    {/* 파일 업로드 버튼 */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute right-3 bottom-3 p-1 text-muted-foreground hover:text-primary disabled:opacity-50 transition-colors"
                        disabled={!isLoggedIn || isSubmitting}
                    >
                        <ImagePlus size={20} />
                    </button>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />

                <Button
                    type="submit"
                    className="h-full px-6"
                    disabled={!isLoggedIn || isSubmitting}
                >
                    {isSubmitting ? "등록 중..." : "등록"}
                </Button>
            </form>
        </div>
    );
}