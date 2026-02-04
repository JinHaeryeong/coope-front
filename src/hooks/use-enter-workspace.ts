// src/hooks/use-enter-workspace.ts
import { useNavigate } from "react-router-dom"; // next/navigation 대신 사용
import { useState } from "react";

export const useEnterWorkspace = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    // TODO: 나중에 Spring Boot API 연동 (axios/fetch)
    const onEnter = async () => {
        setIsLoading(true);
        try {
            // 현재는 워크스페이스가 없으므로 임시 ID로 이동하거나 
            // 워크스페이스 생성 로직이 들어갈 자리입니다.
            console.log("워크스페이스 진입 로직 실행");

            // 임시 워크스페이스 ID로 이동 테스트
            const tempId = "test-workspace-id";
            navigate(`/workspace/${tempId}/documents`);
        } catch (error) {
            console.error("Enter workspace error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        onEnter,
        isLoading,
        user: { fullName: "임시 사용자" } // UI 확인용 가짜 데이터
    };
};