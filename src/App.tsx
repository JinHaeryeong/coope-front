import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MarketingLayout } from './layouts/MarketingLayout';
import { ThemeProvider } from "@/components/provider/themeProvider"
import { ModalProvider } from './components/provider/ModalProvider';
import MarketingPage from './pages/Marketing/marketingPage';
import SignupPage from './pages/Marketing/signupPage';

function App() {
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
              <Route path="/introduction" element={<div>Intro</div>} />
              <Route path="/support" element={<div>Support</div>} />
            </Route>

            {/* 인증 페이지 */}
            <Route path="/auth/sign-in" element={<div>Sign In</div>} />

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