import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet, useParams } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useSidebarStore } from '@/store/useSidebarStore'; // 추가

import { Button } from '@/components/ui/button';
import { Ghost, MenuIcon } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { AIChatModal } from "@/components/Main/Modal/AiChatModal";
import { SearchCommand } from "@/components/Main/SearchCommand";
import { Navigation } from '@/components/Main/Navigation';
import { cn } from '@/lib/utils';
import { useFriendStore } from '@/store/useFriendStore';
import { useMediaQuery } from "usehooks-ts";
import { Navbar } from '@/components/Main/Navbar';
import { useDocumentSocket } from '@/hooks/useDocumentSocket';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useWorkspaceSocket } from '@/hooks/useWorkspaceSocket';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { toast } from 'sonner';
import { useFetchAiUsage } from '@/hooks/useFetchAiUsage';

export const MainLayout = () => {
  const { isLoggedIn, accessToken } = useAuthStore();
  const { isCollapsed, isResetting, toggle } = useSidebarStore();
  const { workspaces } = useWorkspaceStore();
  const { workspaceCode, documentId } = useParams<{ workspaceCode: string; documentId: string }>();
  const { clearDocuments } = useDocumentStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { fetchUsage } = useFetchAiUsage();
  useWorkspaceSocket();

  useEffect(() => {
    if (workspaceCode) {
      clearDocuments();
    }
  }, [workspaceCode, clearDocuments]);

  useEffect(() => {
    if (isLoggedIn && accessToken) {
      fetchUsage();
    }
  }, [isLoggedIn, accessToken, fetchUsage]);

  useDocumentSocket(workspaceCode);
  const isMobile = useMediaQuery("(max-width:768px)");
  const isChatActive = useFriendStore((state) => state.isChatActive);
  const shouldHideMenuIcon = isMobile && pathname.includes("/friends") && isChatActive;

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
      return;
    }
    if (workspaceCode && workspaces.length > 0) {
      const isValid = workspaces.some(w => w.inviteCode === workspaceCode);

      if (!isValid) {
        toast.error("존재하지 않거나 접근 권한이 없는 워크스페이스입니다.");
        navigate('/');
      }
    }
  }, [isLoggedIn, workspaceCode, workspaces, navigate]);

  if (isLoggedIn && !accessToken) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="h-screen flex dark:bg-[#1F1F1F] overflow-hidden">
      <Navigation />

      <main className="flex-1 h-full flex flex-col overflow-hidden relative">
        <SearchCommand />

        <div className={cn(
          "w-full bg-background dark:bg-[#1F1F1F] z-10",
          isResetting && "transition-all ease-in-out duration-300"
        )}>
          {!!documentId ? (
            <Navbar isCollapsed={isCollapsed} onResetWidth={toggle} />
          ) : (
            <nav className="bg-transparent px-3 py-2 w-full">
              {isCollapsed && !shouldHideMenuIcon && (
                <MenuIcon
                  role="button"
                  onClick={toggle}
                  className="h-6 w-6 text-muted-foreground cursor-pointer transition"
                />
              )}
            </nav>
          )}
        </div>

        {!pathname.includes("/friends") && (
          <Button
            type="button"
            className="fixed bottom-5 right-5 z-50 rounded-full shadow-md"
            onClick={() => setIsChatOpen(true)}
          >
            <Ghost className="w-5 h-5" />
          </Button>
        )}

        {isChatOpen && (
          <AIChatModal
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
          />
        )}

        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};