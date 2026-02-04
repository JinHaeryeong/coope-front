import { useState } from "react";
import { Link } from "react-router-dom"; // react-router-dom으로 교체
import { Menu, X } from "lucide-react";

import { useScrollTop } from "@/hooks/useScrollTop";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ModeToggle } from "@/components/Common/ModeToggle";
import { Logo } from "./Logo";
import { useLoginModal } from "@/hooks/useLoginModal";

const Links = [
    { href: "/notice", text: '공지사항' },
    { href: "/introduction", text: '회사소개' },
    { href: "/support", text: '고객지원' },
]

export const Navbar = () => {
    const loginModal = useLoginModal();
    const scrolled = useScrollTop();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // TODO: 나중에 Spring Boot 백엔드 인증 로직과 연결
    const isAuthenticated = false;
    const isLoading = false;

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    }

    // 모달 핸들러
    const handleLoginModal = () => {
        loginModal.onOpen(); // 전역 모달 열기
        setIsMobileMenuOpen(false);
    };

    return (
        <div className={cn(
            "z-50 bg-background dark:bg-[#1F1F1F] sticky top-0 flex items-center w-full",
            scrolled && "border-b shadow-sm"
        )}>
            <div className="relative z-60 flex items-center justify-between w-full p-2 md:p-6 bg-background dark:bg-[#1F1F1F]">
                {/* Link의 href를 to로 변경 */}
                <Link to="/"><Logo /></Link>

                <div className="md:ml-auto md:justify-end justify-between flex items-center gap-x-10">
                    <nav className="hidden md:flex">
                        <ul className="flex space-x-4 gap-x-10">
                            {Links.map((link) => (
                                <li key={link.href} className="relative group font-medium">
                                    <Link to={link.href} className="capitalize">
                                        {link.text}
                                    </Link>
                                    <span className="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-black dark:bg-white"></span>
                                </li>
                            ))}
                            {isLoading && <Spinner />}
                            {!isAuthenticated && !isLoading && (
                                <li className="relative group font-medium cursor-pointer" onClick={handleLoginModal}>
                                    <span>로그인</span>
                                    <span className="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-black dark:bg-white"></span>
                                </li>
                            )}
                        </ul>
                    </nav>

                    <div className="hidden md:flex items-center gap-x-10">
                        {isAuthenticated && !isLoading && (
                            <Button variant="ghost" size="sm" asChild>
                                <Link to="/profile">프로필</Link>
                            </Button>
                        )}
                        <ModeToggle />
                    </div>

                    <Button
                        onClick={toggleMobileMenu}
                        variant="ghost"
                        size="sm"
                        className="md:hidden ml-auto p-2"
                    >
                        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </div>



            {isMobileMenuOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/40 md:hidden"
                        style={{ zIndex: 40 }}
                        onClick={toggleMobileMenu}
                    />

                    <nav
                        className="absolute top-full left-0 w-full bg-background dark:bg-[#1F1F1F] border-b shadow-xl md:hidden p-6 animate-in slide-in-from-top-5 duration-200"
                        style={{ zIndex: 55 }}
                    >
                        <ul className="flex flex-col space-y-4">
                            {Links.map((link) => (
                                <li key={link.href} className="text-lg font-medium" onClick={toggleMobileMenu}>
                                    <Link to={link.href} className="capitalize block w-full">
                                        {link.text}
                                    </Link>
                                </li>
                            ))}
                            <hr className="dark:border-slate-700" />
                            {!isAuthenticated && !isLoading && (
                                <li className="relative group font-medium cursor-pointer" onClick={handleLoginModal}>
                                    <span>로그인</span>
                                    <span className="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-black dark:bg-white"></span>
                                </li>
                            )}
                            {isAuthenticated && !isLoading && (
                                <li className="text-lg font-medium" onClick={toggleMobileMenu}>
                                    <Link to="/profile" className="block w-full">프로필</Link>
                                </li>
                            )}
                            <li className="flex items-center justify-between pt-2">
                                <ModeToggle />
                            </li>
                        </ul>
                    </nav>
                </>
            )}
        </div>
    )
}