import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { MarketingLayout } from './layouts/MarketingLayout';
import { ThemeProvider } from "@/components/provider/themeProvider"
import { ModalProvider } from './components/provider/ModalProvider';
import { useAuthStore } from './store/useAuthStore';
import { Toaster } from 'sonner';
import { AdminGuard } from './components/Auth/AdminGuard';
import { LoginSuccess } from './pages/loginSuccess';
import { ScrollToTop } from './components/Common/ScrollToTop';
import { Spinner } from './components/ui/spinner';
import { MainLayout } from './layouts/MainLayout';
import { apiRefreshToken } from './api/userApi';
import { useCallStore } from './store/useCallStore';

const MarketingPage = lazy(() => import('./pages/Marketing/marketingPage'));
const SignupPage = lazy(() => import('./pages/Marketing/signupPage'));
const IntroductionPage = lazy(() => import('./pages/Marketing/introducePage'));
const SupportPage = lazy(() => import('./pages/Marketing/supportPage'));
const InquiryPage = lazy(() => import('./pages/Marketing/inquiries/inquiryPage'));
const UnderConstructionPage = lazy(() => import('./pages/Marketing/underConstructionPage'));

const NoticePage = lazy(() => import('./pages/Marketing/notices/noticePage'));
const NoticeDetailPage = lazy(() => import('./pages/Marketing/notices/noticeDetailPage'));
const NoticeWritePage = lazy(() => import('./pages/Marketing/notices/noticeWritePage'));
const NoticeEditPage = lazy(() => import('./pages/Marketing/notices/noticeEditPage'));


const DocumentsPage = lazy(() => import('./pages/Workspace/documentsPage'));
const FriendsPage = lazy(() => import('./pages/Workspace/Friend/FriendsPage'));
const InvitePage = lazy(() => import('./pages/Workspace/Invite/invitePage'));

import CallModal from './components/Call/CallModal';

function App() {

  const { isLoggedIn, accessToken, user, signIn, signOut } = useAuthStore();
  const { isOpen, isMinimized, roomId, closeCall } = useCallStore();

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

          {(isOpen || isMinimized) && roomId && (
            <CallModal
              isOpen={isOpen}
              roomId={roomId}
              onClose={closeCall}
            />
          )}
          <Suspense fallback={<Spinner />}>


            <Routes>
              <Route path="/login-success" element={<LoginSuccess />} />
              <Route path="/invite/:workspaceCode" element={<InvitePage />} />

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

              <Route path="/workspace/:workspaceCode" element={<MainLayout />}>
                {/* /workspace/abc 접속 시 (index) */}
                <Route index element={<DocumentsPage />} />

                {/* /workspace/abc/documents/123 접속 시 */}
                <Route path="documents/:documentId" element={<DocumentsPage />} />
                <Route path="friends" element={<FriendsPage />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ThemeProvider>
    </>
  );
}
export default App;