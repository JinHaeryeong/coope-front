import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom"; // 페이지 이동을 위해 추가

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useEnterWorkspace } from "@/hooks/use-enter-workspace";
import { Logo } from "./Logo";
import { useLoginModal } from "@/hooks/useLoginModal";

export const Heading = () => {

  const loginModal = useLoginModal();
  // TODO: 나중에 Spring Boot 백엔드와 연결될 인증 상태들
  // 현재는 UI 확인을 위해 임시로 설정해둡니다.
  const isAuthenticated = false; // 로그인 여부 (나중에 전역 상태나 API로 교체)
  const authLoading = false;    // 인증 정보 로딩 여부

  const { onEnter, isLoading: workspaceLoading } = useEnterWorkspace();

  // 통합 로딩 상태
  const isLoading = authLoading || workspaceLoading;

  // 로그인하지 않은 사용자가 '시작하기'를 눌렀을 때의 동작
  const onStart = () => {
    if (isAuthenticated) {
      onEnter();
    } else {
      // 이제 페이지 이동 대신 모달을 엽니다!
      loginModal.onOpen();
    }
  };

  return (
    <div className="max-w-3xl space-y-4 min-h-44 flex flex-col items-center">
      <h3 className="text-base sm:text-xl md:text-2xl font-medium">
        협업을 새롭게 정의하다
      </h3>

      <div className="w-full flex justify-center">
        <Logo />
      </div>

      <div className="h-12 w-full flex items-center justify-center">
        {isLoading ? (
          <Spinner />
        ) : (
          <Button onClick={onStart} size="lg">
            시작하기
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};