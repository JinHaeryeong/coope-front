import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            <h1 className="text-9xl font-extrabold text-slate-200">404</h1>
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">페이지를 찾을 수 없습니다.</h2>
                <p className="text-muted-foreground">존재하지 않는 주소이거나 삭제된 페이지입니다.</p>
            </div>
            <Button onClick={() => navigate("/")} size="lg">
                메인으로 돌아가기
            </Button>
        </div>
    );
}