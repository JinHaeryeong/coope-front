import { useAuthStore } from "@/store/useAuthStore";
import { useAiUsageStore } from "@/store/useAiUsageStore";

export const apiStreamChat = async (message: string, previousMessages: any[], signal: AbortSignal) => {
    // Zustand 스토어에서 최신 액세스 토큰 가져오기
    const accessToken = useAuthStore.getState().accessToken;
    const API_HOST = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

    const response = await fetch(`${API_HOST}/api/ai-chat/stream`, { // 전체 경로 확인
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            // 인증 헤더 수동 추가 (Axios 인터셉터가 안 해줌)
            "Authorization": accessToken ? `Bearer ${accessToken}` : "",
        },
        body: JSON.stringify({
            message,
            previousMessages: previousMessages.slice(-20)
        }),
        signal,
    });

    // 만약 401(토큰 만료)이 뜬다면? 
    // 사실 여기서 인터셉터처럼 재발급 로직을 넣을 순 있지만, 
    // 일단은 에러 처리 후 사용자가 다시 로그인하거나 갱신하게 유도하는 게 좋음
    if (!response.ok) {
        if (response.status === 401) {
            // 토큰 재발급 로직을 여기서 호출하거나 로그아웃 처리
            console.error("인증이 만료되었습니다.");
        }
        throw new Error("AI 응답을 가져오는데 실패했습니다.");
    }

    const remaining = response.headers.get("X-AI-Remaining");
    if (remaining !== null) {
        // Zustand 스토어 업데이트 (문자열을 숫자로 바꿔서!)
        useAiUsageStore.getState().setUsage("CHAT", parseInt(remaining, 10));
    }

    if (!response.body) throw new Error("응답 본문이 비어있습니다.");

    return response.body.getReader();
};