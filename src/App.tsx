import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { MarketingLayout } from './layouts/MarketingLayout';
import { ThemeProvider } from "@/components/provider/themeProvider"
import { ModalProvider } from './components/provider/ModalProvider';
import { Toaster } from 'sonner';
import { LoginSuccess } from './pages/loginSuccess';
import { ScrollToTop } from './components/Common/ScrollToTop';
import { Spinner } from './components/ui/spinner';
import { MainLayout } from './layouts/MainLayout';

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


const FriendsPage = lazy(() => import('./pages/Workspace/Friend/friendsPage'));
const InvitePage = lazy(() => import('./pages/Workspace/Invite/invitePage'));
const DocumentsWelcomePage = lazy(() => import('./pages/Workspace/Document/documentsWelcomePage'))
import NotFoundPage from './pages/notFoundPage';
import { apiRefreshToken } from './features/auth/api/userApi';
import { AdminGuard } from './features/auth/components/AdminGuard';
import { useAuthStore } from './features/auth/store/useAuthStore';
import { useCallStore } from './features/call/store/useCallStore';
import CallModal from './features/call/components/CallModal';
const PostDetailPage = lazy(() => import('./pages/Community/postDetailPage'));
const CommunityPage = lazy(() => import('./pages/Community/communityPage'));
const PostWritePage = lazy(() => import('./pages/Community/postWritePage'))
const DocumentsPage = lazy(() => import('./pages/Workspace/Document/DocumentPage'));
const ProfilePage = lazy(() => import('./pages/Marketing/ProfilePage'));
const InquiryWritePage = lazy(() => import('./pages/Marketing/inquiries/inquiryWritePage'));
const InquiryDetailPage = lazy(() => import('./pages/Marketing/inquiries/inquiryDetailPage'));
const FindAccountPage = lazy(() => import('./pages/Marketing/findAccountPage'));
const ResetPasswordPage = lazy(() => import('./pages/Marketing/resetPasswordPage'));

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
                <Route path="/find-account" element={<FindAccountPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/notice" element={<NoticePage />} />
                <Route path="/community" element={<CommunityPage />} />
                <Route path="/community/write" element={<PostWritePage />} />
                <Route path="/community/:id" element={<PostDetailPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/notice/:id" element={<NoticeDetailPage />} />
                <Route element={<AdminGuard children={<Outlet />} />}>
                  <Route path="/notice/write" element={<NoticeWritePage />} />
                  <Route path="/notice/edit/:id" element={<NoticeEditPage />} />
                  <Route path="/admin" element={<div>아직없소용</div>} />
                </Route>
                <Route path="/introduction" element={<IntroductionPage />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/inquiry" element={<InquiryPage />} />
                <Route path="/inquiry/write" element={<InquiryWritePage />} />
                <Route path="/inquiry/:id" element={<InquiryDetailPage />} />
                <Route path="/function" element={<UnderConstructionPage />} />
              </Route>

              <Route path="/workspace/:workspaceCode" element={<MainLayout />}>
                {/* /workspace/abc 접속 시 (index) */}
                <Route index element={<DocumentsWelcomePage />} />

                {/* /workspace/abc/documents/123 접속 시 */}
                <Route path="documents/:documentId" element={<DocumentsPage />} />
                <Route path="friends" element={<FriendsPage />} />
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ThemeProvider>
    </>
  );
}
export default App;