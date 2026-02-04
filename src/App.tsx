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

          <Routes>
            {/* 마케팅/랜딩 페이지 */}
            <Route element={<MarketingLayout />}>
              <Route path="/" element={<MarketingPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/notice" element={<div>Notice</div>} />
              <Route path="/introduction" element={<IntroductionPage />} />
              <Route path="/support" element={<div>Support</div>} />
            </Route>

            {/* 메인 워크스페이스 (로그인 후) */}
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