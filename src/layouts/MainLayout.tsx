import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

import { Button } from '@/components/ui/button';
import { Ghost } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { AIChatModal } from "@/components/Main/Modal/AiChatModal";
import { SearchCommand } from "@/components/Main/SearchCommand";
import { Navigation } from '@/components/Main/Navigation';

export const MainLayout = () => {
  const { isLoggedIn, accessToken } = useAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  if (isLoggedIn && !accessToken) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="h-screen flex dark:bg-[#1F1F1F]">
      <Navigation />

      <main className="flex-1 h-full overflow-y-auto relative">
        <SearchCommand />

        {!pathname.includes("/friends") && (
          <Button
            type="button"
            className="fixed bottom-5 right-5 z-9 rounded-full shadow-md"
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

        <Outlet />
      </main>
    </div>
  );
};