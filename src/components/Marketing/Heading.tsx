import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useEnterWorkspace } from "@/hooks/useEnterWorkspace";
import { Logo } from "./Logo";
import { useLoginModal } from "@/hooks/useLoginModal";
import { useAuthStore } from "@/store/authStore";

export const Heading = () => {

  const loginModal = useLoginModal();

  const { isLoggedIn, accessToken } = useAuthStore();
  const authLoading = isLoggedIn && !accessToken;

  const { onEnter, isLoading: workspaceLoading } = useEnterWorkspace();

  // 통합 로딩 상태
  const isLoading = authLoading || workspaceLoading;

  const onStart = () => {
    if (isLoggedIn) {
      // 로그인 되어 있으면 워크스페이스 진입 로직 실행
      onEnter();
    } else {
      // 로그인 안 되어 있으면 로그인 모달 열기
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
          <Button onClick={onStart} size="lg" className="cursor-pointer">
            시작하기
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};