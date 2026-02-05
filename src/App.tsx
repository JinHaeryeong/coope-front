import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MarketingLayout } from './layouts/MarketingLayout';
import { ThemeProvider } from "@/components/provider/themeProvider"
import { ModalProvider } from './components/provider/ModalProvider';
import MarketingPage from './pages/Marketing/marketingPage';
import SignupPage from './pages/Marketing/signupPage';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import axiosInstance from './api/axiosInstance';
import IntroductionPage from './pages/Marketing/introducePage';
import SupportPage from './pages/Marketing/supportPage';
import NoticePage from './pages/Marketing/notices/noticePage';
import { Toaster } from 'sonner';
import NoticeDetailPage from './pages/Marketing/notices/noticeDetailPage';
import NoticeWritePage from './pages/Marketing/notices/noticeWritePage';
import { AdminGuard } from './components/Auth/AdminGuard';

function App() {

  const { isLoggedIn, accessToken, user, signIn, signOut } = useAuthStore();

  useEffect(() => {
    // 로그인은 되어있는데 액세스 토큰만 없는 경우 (새로고침 상황)
    if (isLoggedIn && !accessToken) {
      const restoreLogin = async () => {
        try {
          const response = await axiosInstance.post("/auth/refresh");
          const { accessToken: newAccessToken } = response.data;

          if (user) {
            signIn(newAccessToken, user);
            console.log("세션 복구 성공");
          }
        } catch (error) {
          console.error("세션 복구 실패:", error);
          signOut(); // 리프레시 토큰이 만료되었거나 문제가 있으면 로그아웃 처리
        }
      };

      restoreLogin();
    }
  }, [isLoggedIn, accessToken, user, signIn, signOut]);
  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <BrowserRouter>
          <ModalProvider />
          <Toaster position='bottom-center' />

          <Routes>
            <Route element={<MarketingLayout />}>
              <Route path="/" element={<MarketingPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/notice" element={<NoticePage />} />
              <Route path="/notice/:id" element={<NoticeDetailPage />} />
              <Route path="/notice/write" element={<AdminGuard>
                <NoticeWritePage />
              </AdminGuard>} />
              <Route path="/introduction" element={<IntroductionPage />} />
              <Route path="/support" element={<SupportPage />} />
            </Route>

            <Route path="/workspace/:workspaceId" element={<div>Workspace Page</div>}>
              <Route path="documents/:documentId" element={<div>Editor Page</div>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </>
  );
}
export default App;