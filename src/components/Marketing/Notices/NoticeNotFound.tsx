import { FileQuestion, List, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const NoticeNotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 pb-24">
            <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-6">
                <FileQuestion size={48} className="text-muted-foreground" />
            </div>

            <h1 className="text-2xl font-bold mb-3 text-slate-900 dark:text-slate-100">
                공지사항을 찾을 수 없습니다
            </h1>

            <p className="text-muted-foreground mb-8 max-w-sm leading-relaxed">
                해당 게시글이 삭제되었거나 주소가 올바르지 않습니다. <br />
                번호를 다시 확인해 주세요.
            </p>

            <div className="flex gap-3">
                <Button variant="outline" onClick={() => navigate("/notice")} className="gap-2">
                    <List size={18} /> 목록으로
                </Button>
                <Button onClick={() => navigate("/")} className="gap-2">
                    <Home size={18} /> 홈으로
                </Button>
            </div>
        </div>
    );
};