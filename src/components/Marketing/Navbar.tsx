import { useState } from "react";
import { Link } from "react-router-dom"; // react-router-dom으로 교체
import { HatGlassesIcon, LogOut, Menu, UserIcon, X } from "lucide-react";

import { useScrollTop } from "@/hooks/useScrollTop";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ModeToggle } from "@/components/Common/ModeToggle";
import { Logo } from "./Logo";
import { useLoginModal } from "@/hooks/useLoginModal";
import { useAuthStore } from "@/store/authStore";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Links = [
    { href: "/notice", text: '공지사항' },
    { href: "/introduction", text: '회사소개' },
    { href: "/support", text: '고객지원' },
]

export const Navbar = () => {
    const loginModal = useLoginModal();
    const scrolled = useScrollTop();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const { isLoggedIn, user, signOut } = useAuthStore();
    const isLoading = false;

    const canWrite = isLoggedIn && user?.role === "ROLE_ADMIN";

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
                            {!isLoggedIn && !isLoading && (
                                <li className="relative group font-medium cursor-pointer" onClick={handleLoginModal}>
                                    <span>로그인</span>
                                    <span className="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-black dark:bg-white"></span>
                                </li>
                            )}
                        </ul>
                    </nav>

                    <div className="hidden md:flex items-center gap-x-10">
                        {isLoggedIn && !isLoading && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <div className="cursor-pointer hover:opacity-80 transition ml-4">
                                        <Avatar className="h-9 w-9 border">
                                            <AvatarImage
                                                src={user?.userIcon ? `http://localhost:8080${user.userIcon}` : "/default-icon.png"}
                                                alt={user?.nickname}
                                            />
                                            <AvatarFallback className="bg-sky-500 text-white">
                                                {user?.nickname?.charAt(0) || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{user?.nickname}</p>
                                            <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild className="cursor-pointer">
                                        <Link to="/profile">
                                            <UserIcon className="mr-2 h-4 w-4" />
                                            <span>프로필 설정</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {canWrite &&
                                        <>
                                            <DropdownMenuItem asChild className="cursor-pointer">
                                                <Link to="/profile">
                                                    <HatGlassesIcon className="mr-2 h-4 w-4" />
                                                    <span>관리자 페이지</span>
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                        </>
                                    }
                                    <DropdownMenuItem
                                        className="text-red-600 cursor-pointer focus:text-red-600"
                                        onClick={() => signOut()}
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>로그아웃</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
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
                            {isLoggedIn && user && (
                                <div className="flex items-center gap-x-4 pb-4 border-b dark:border-slate-700">
                                    <Avatar className="h-12 w-12 border">
                                        <AvatarImage
                                            src={user?.userIcon ? `${import.meta.env.VITE_API_BASE_URL}${user.userIcon}` : "/default-icon.png"}
                                            alt={user?.nickname}
                                        />
                                        <AvatarFallback className="bg-sky-500 text-white">
                                            {user?.nickname?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <p className="text-base font-bold leading-none">{user?.nickname}님</p>
                                        <p className="text-xs text-muted-foreground mt-1">{user?.email}</p>
                                    </div>
                                </div>
                            )}

                            {Links.map((link) => (
                                <li key={link.href} className="text-lg font-medium" onClick={toggleMobileMenu}>
                                    <Link to={link.href} className="capitalize block w-full">
                                        {link.text}
                                    </Link>
                                </li>
                            ))}

                            <hr className="dark:border-slate-700" />

                            {!isLoggedIn && !isLoading && (
                                <li className="text-lg font-medium cursor-pointer py-2" onClick={handleLoginModal}>
                                    로그인
                                </li>
                            )}

                            {isLoggedIn && !isLoading && (
                                <>
                                    <li className="text-lg font-medium" onClick={toggleMobileMenu}>
                                        <Link to="/profile" className="block w-full">프로필 설정</Link>
                                    </li>
                                    {canWrite && (
                                        <li className="text-lg font-medium">
                                            <Link to="/manage" className="block w-full">관리자 페이지</Link>
                                        </li>
                                    )}
                                    <li
                                        className="text-lg font-medium text-red-600 cursor-pointer py-2"
                                        onClick={() => {
                                            signOut();
                                            toggleMobileMenu();
                                        }}
                                    >
                                        <div className="flex items-center">
                                            <LogOut className="mr-2 h-5 w-5" />
                                            <span>로그아웃</span>
                                        </div>
                                    </li>
                                </>
                            )}

                            <li className="flex items-center justify-between pt-2 border-t dark:border-slate-700">
                                <span className="text-sm font-medium">테마 변경</span>
                                <ModeToggle />
                            </li>
                        </ul>
                    </nav>
                </>
            )}
        </div>
    )
}