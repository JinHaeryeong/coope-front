import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { MarketingLayout } from './layouts/MarketingLayout';
import { ThemeProvider } from "@/components/provider/themeProvider"
import { ModalProvider } from './components/provider/ModalProvider';
import MarketingPage from './pages/Marketing/marketingPage';
import SignupPage from './pages/Marketing/signupPage';
import { useEffect } from 'react';
import { useAuthStore } from './store/useAuthStore';
import IntroductionPage from './pages/Marketing/introducePage';
import SupportPage from './pages/Marketing/supportPage';
import NoticePage from './pages/Marketing/notices/noticePage';
import { Toaster } from 'sonner';
import NoticeDetailPage from './pages/Marketing/notices/noticeDetailPage';
import NoticeWritePage from './pages/Marketing/notices/noticeWritePage';
import { AdminGuard } from './components/Auth/AdminGuard';
import { UnderConstructionPage } from './pages/Marketing/underConstructionPage';
import NoticeEditPage from './pages/Marketing/notices/noticeEditPage';
import { LoginSuccess } from './pages/loginSuccess';
import { ScrollToTop } from './components/Common/ScrollToTop';
import InquiryPage from './pages/Marketing/inquiries/inquiryPage';
import { Spinner } from './components/ui/spinner';
import { MainLayout } from './layouts/MainLayout';
import DocumentsPage from './pages/Workspace/documentsPage';
import { apiRefreshToken } from './api/userApi';

function App() {

  const { isLoggedIn, accessToken, user, signIn, signOut } = useAuthStore();

  useEffect(() => {
    // 로그인은 되어있는데 액세스 토큰만 없는 경우
    if (isLoggedIn && !accessToken) {
      const restoreLogin = async () => {
        try {
          const response = await apiRefreshToken();
          const { accessToken: newAccessToken } = response;

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

  useEffect(() => {
    if (!isLoggedIn || !accessToken) return;

    const silentRefreshInterval = setInterval(async () => {
      try {
        console.log("자동 토큰 갱신 시도 중...");
        const res = await apiRefreshToken();
        const newAccessToken = res.accessToken;

        if (user) {
          signIn(newAccessToken, user);
          console.log("자동 토큰 갱신 성공");
        }
      } catch (error) {
        console.error("자동 토큰 갱신 실패:", error);
      }
    }, 14 * 60 * 1000); // 14분

    return () => clearInterval(silentRefreshInterval);
  }, [isLoggedIn, accessToken, user, signIn]);


  if (isLoggedIn && !accessToken) {
    return <Spinner />;
  }
  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <BrowserRouter>
          <ScrollToTop />
          <ModalProvider />
          <Toaster position='bottom-center' />

          <Routes>
            <Route path="/login-success" element={<LoginSuccess />} />

            <Route element={<MarketingLayout />}>
              <Route path="/" element={<MarketingPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/notice" element={<NoticePage />} />
              <Route path="/notice/:id" element={<NoticeDetailPage />} />
              <Route element={<AdminGuard children={<Outlet />} />}>
                <Route path="/notice/write" element={<NoticeWritePage />} />
                <Route path="/notice/edit/:id" element={<NoticeEditPage />} />
                <Route path="/admin" element={<div>아직없소용</div>} />
              </Route>
              <Route path="/introduction" element={<IntroductionPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/inquiry" element={<InquiryPage />} />
              <Route path="*" element={<UnderConstructionPage />} />
            </Route>

            <Route path="/workspace/:workspaceId" element={<MainLayout />}>
              {/* /workspace/abc 접속 시 (index) */}
              <Route index element={<DocumentsPage />} />

              {/* /workspace/abc/documents/123 접속 시 */}
              <Route path="documents/:documentId" element={<DocumentsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </>
  );
}
export default App;