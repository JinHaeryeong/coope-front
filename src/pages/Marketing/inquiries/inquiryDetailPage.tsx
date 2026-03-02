import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    CalendarDays, Computer, MessageCircle, User,
    Trash2, MessageSquare, Download, Loader2,
    Clock, ZoomIn,
    UserCog
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { formatDate } from "@/lib/utils";
import { apiGetInquiryById, apiDeleteInquiry, apiCreateInquiryAnswer } from "@/api/inquiryApi";

const InquiryDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const [inquiry, setInquiry] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isAnswerOpen, setIsAnswerOpen] = useState(false);
    const [answerContent, setAnswerContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isAdmin = user?.role === "ROLE_ADMIN";

    useEffect(() => {
        const fetchDetail = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await apiGetInquiryById(Number(id));
                setInquiry(data);
            } catch (error) {
                console.error(error);
                toast.error("문의 내용을 불러오는데 실패했습니다.");
                navigate("/inquiry");
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id, navigate]);

    const handleDelete = async () => {
        if (!id) return;
        try {
            await apiDeleteInquiry(Number(id));
            toast.success("문의가 삭제되었습니다.");
            navigate("/inquiry");
        } catch (error) {
            toast.error("삭제 중 오류가 발생했습니다.");
        }
    };

    const handleAnswerSubmit = async () => {
        if (!answerContent.trim()) {
            toast.error("답변 내용을 입력해주세요.");
            return;
        }

        try {
            setIsSubmitting(true);
            await apiCreateInquiryAnswer(Number(id), answerContent);
            toast.success("답변이 등록되었습니다.");

            const updatedData = await apiGetInquiryById(Number(id));
            setInquiry(updatedData);
            setIsAnswerOpen(false); // 입력창 닫기
        } catch (error) {
            toast.error("답변 등록에 실패했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-xl font-medium">데이터를 불러오는 중입니다...</p>
        </div>
    );

    if (!inquiry) return <div className="text-center py-20 text-xl font-bold">존재하지 않는 문의입니다.</div>;

    return (
        <div className="px-4 md:px-12 min-h-full flex justify-center py-10">
            <div className="w-full max-w-8xl">

                <nav className="flex gap-2 mb-6 text-sm md:text-base text-slate-500 dark:text-slate-400">
                    <Link to="/" className="hover:text-primary transition-colors">홈</Link>
                    <span>&gt;</span>
                    <Link to="/inquiry" className="hover:text-primary transition-colors">고객지원</Link>
                </nav>

                <h1 className="text-3xl md:text-5xl font-black mb-6 md:mb-8 break-all tracking-tight text-slate-900 dark:text-slate-50">
                    {inquiry.title}
                </h1>

                <div className="flex flex-wrap gap-4 md:gap-8 text-sm md:text-lg mb-8 pb-6 border-b text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                        <User size={18} className="text-primary" />
                        <span>{inquiry.userName || "익명 유저"}</span> 작성
                    </div>
                    <div className="flex items-center gap-2">
                        <CalendarDays size={18} />
                        {formatDate(inquiry.createdAt)}
                    </div>
                    <div className="flex items-center gap-2">
                        <MessageCircle size={18} />
                        문의 유형: <span>{inquiry.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Computer size={18} />
                        환경: <span>{inquiry.environment}</span>
                    </div>
                </div>

                <div className="text-slate-700 text-base md:text-lg leading-relaxed dark:text-slate-200 wrap-break-word">
                    {inquiry.content}
                </div>

                {inquiry.imageUrls && inquiry.imageUrls.length > 0 && (
                    <div className="mt-12 pt-10 border-t">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Download className="text-primary" /> 첨부 파일 ({inquiry.imageUrls.length})
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {inquiry.imageUrls.map((url: string, index: number) => (
                                <Dialog key={index}>
                                    <DialogTrigger asChild>
                                        <div className="group relative rounded-2xl overflow-hidden border-2 shadow-sm hover:shadow-xl transition-all duration-300 bg-muted cursor-pointer">
                                            <img
                                                src={url}
                                                alt={`첨부 이미지 ${index + 1}`}
                                                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <div className="bg-black/60 text-white font-bold px-5 py-2.5 rounded-full backdrop-blur-md flex items-center gap-2 scale-90 group-hover:scale-100 transition-transform">
                                                    <ZoomIn size={18} /> 원본 보기
                                                </div>
                                            </div>
                                        </div>
                                    </DialogTrigger>

                                    <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none backdrop-blur-sm shadow-none flex items-center justify-center">
                                        <div className="relative w-full h-full flex items-center justify-center">
                                            <img
                                                src={url}
                                                alt="확대 이미지"
                                                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                                            />
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            ))}
                        </div>
                    </div>
                )}

                {(user?.id === inquiry.userId || isAdmin) && (
                    <div className="flex justify-end gap-4 mt-12 pt-6 border-t">
                        {isAdmin && inquiry.status !== "COMPLETED" && (
                            <Button variant="outline" size="lg" className="gap-2 text-lg h-12" onClick={() => setIsAnswerOpen(!isAnswerOpen)}>
                                <MessageSquare size={20} /> 답변
                            </Button>
                        )}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button>
                                    <Trash2 size={18} /> 삭제
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="max-w-xl">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-2xl">문의를 삭제하시겠습니까?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-lg">
                                        삭제된 문의는 복구되지 않습니다. 정말 삭제하시겠습니까?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="mt-4">
                                    <AlertDialogCancel className="h-12 text-lg">취소</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 h-12 text-lg">삭제하기</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                )}

                {isAdmin && isAnswerOpen && !inquiry.answer && (
                    <div className="mt-10 p-8 rounded-[32px] border-2 border-dashed border-primary/30 bg-primary/5 space-y-4 animate-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center gap-2 text-primary font-bold text-xl">
                            <MessageSquare size={24} />
                            운영팀 답변 작성
                        </div>
                        <textarea
                            className="w-full h-40 p-4 rounded-2xl border bg-card outline-none focus:ring-2 focus:ring-primary/50 resize-none text-lg"
                            placeholder="사용자에게 전달할 답변 내용을 입력하세요..."
                            value={answerContent}
                            onChange={(e) => setAnswerContent(e.target.value)}
                        />
                        <div className="flex justify-end">
                            <Button
                                size="lg"
                                className="px-10 h-12 text-lg font-bold"
                                onClick={handleAnswerSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "등록 중..." : "답변 완료"}
                            </Button>
                        </div>
                    </div>
                )}

                <div className="mt-16">
                    <div className="flex items-center gap-3 mb-6">
                        <h2 className="text-3xl font-black">답변</h2>
                    </div>
                    {inquiry.answer ? (
                        <div className="p-8 md:p-12 rounded-[32px] bg-slate-50 dark:bg-slate-900 border-2 border-primary/10 shadow-inner">
                            <div className="flex items-center gap-2 mb-6 text-primary">
                                <UserCog size={28} />
                                <span className="text-xl font-bold">운영팀 답변</span>
                            </div>
                            <div className="text-sm md:text-lg leading-relaxed text-slate-800 dark:text-slate-100 whitespace-pre-wrap">
                                {inquiry.answer}
                            </div>
                            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-sm md:text-base text-slate-400">
                                문의 작성일: {formatDate(inquiry.createdAt)}
                            </div>
                        </div>
                    ) : (
                        <div className="py-20 text-center border-2 border-dashed rounded-[32px] text-slate-400">
                            <Clock size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="text-xl font-medium">아직 등록된 답변이 없습니다.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InquiryDetailPage;