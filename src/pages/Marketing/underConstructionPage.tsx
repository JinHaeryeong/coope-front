import { HardHat, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const UnderConstructionPage = () => {
    const navigate = useNavigate();

    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 pb-24">
            <div className="bg-yellow-100 p-4 rounded-full mb-6">
                <HardHat size={48} className="text-yellow-600 animate-bounce" />
            </div>
            <h1 className="text-2xl font-bold mb-2">페이지 공사 중입니다!</h1>
            <p className="text-muted-foreground mb-8">
                현재 더 나은 서비스를 위해 열심히 작업 중이에요. <br />
                조금만 기다려 주세요!
            </p>
            <Button onClick={() => navigate("/")} className="gap-2">
                <Home size={18} /> 메인으로 돌아가기
            </Button>
        </div>
    );
};

export default UnderConstructionPage;