import { useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Navigation, Pagination, Scrollbar, Autoplay } from "swiper/modules";
import { MailOpen, Github, ArrowRight } from "lucide-react";

import 'swiper/swiper-bundle.css'


import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useEnterWorkspace } from "@/hooks/useEnterWorkspace";
import { useAuthStore } from "@/store/authStore";
import { useLoginModal } from "@/hooks/useLoginModal";

const IntroductionPage = () => {
    const { isLoggedIn, accessToken } = useAuthStore();
    const loginModal = useLoginModal();
    const { onEnter, isLoading: workspaceLoading } = useEnterWorkspace();

    const authLoading = isLoggedIn && !accessToken;
    const isLoading = authLoading || workspaceLoading;

    const target = useRef<HTMLDivElement>(null);

    const pagination = {
        clickable: true,
        renderBullet: function (index: number, className: string) {
            return '<span class="' + className + '">' + (index + 1) + '</span>';
        },
    };

    const teamMembers = [
        { id: 1, name: '김민재', role: '풀스택 개발', content: '팀 안전운전의 팀원입니다. 협업의 가치를 믿습니다.', git: 'https://github.com/codecodecode333' },
        { id: 2, name: '문제창', role: '풀스택 개발', content: '팀 안전운전의 팀원입니다. 사용자 경험을 중시합니다.', git: 'https://github.com/caiper007' },
        { id: 3, name: '진해령', role: '풀스택 개발', content: '팀 안전운전의 팀원입니다. 견고한 아키텍처를 지향합니다.', git: 'https://github.com/JinHaeryeong' },
    ];

    useEffect(() => {
        if (!target.current) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("tracking-in-expand");
                } else {
                    entry.target.classList.remove("tracking-in-expand");
                }
            },
            { threshold: 0.1 }
        );
        observer.observe(target.current);
        return () => observer.disconnect();
    }, []);

    const onStart = () => {
        if (isLoggedIn) {
            onEnter();
        } else {
            loginModal.onOpen();
        }
    };

    return (
        <div className="min-h-screen pt-10 md:pt-20 overflow-x-hidden bg-background">
            <div className="flex flex-col items-center gap-y-8 pb-20">
                {/* 메인 비주얼 이미지 */}
                <div className="w-full max-w-225 px-4">
                    <img
                        src="/introduction.webp"
                        className="w-full h-auto"
                        alt="Introduction visual"
                    />
                </div>

                <div className="w-full px-6 md:px-40 flex flex-col">
                    <div ref={target} className="hidden-box">
                        <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                            <span className="text-blue-500">함께</span> 알아가고<br />
                            창작하는 것을 돕습니다
                        </h2>
                        <p className="font-medium text-base md:text-lg mt-4 text-slate-600 dark:text-slate-400">
                            간단한 글 작성을 위한 공간부터 다양한 사람들이 <br className="hidden md:block" />
                            협업해야 하는 공간까지 우리는 모든 것을 제공합니다.
                        </p>

                        {/* 액션 버튼 섹션 */}
                        <div className="flex flex-wrap gap-3 my-8">
                            {isLoading ? (
                                <div className="w-40 flex items-center justify-center">
                                    <Spinner />
                                </div>
                            ) : (
                                <>
                                    <Button className="shadow-lg mr-2" onClick={onStart} size="lg">
                                        {isLoggedIn ? "워크스페이스 시작" : "지금 시작하기"}
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                    <Button variant="outline" size="lg">
                                        {isLoggedIn ? "기능 살펴보기" : "문의하기"}
                                    </Button>
                                </>
                            )}
                        </div>

                        <div className="relative w-full">
                            <div className="absolute -top-2 left-6 z-20">
                                <div className="absolute top-0 -left-2.5 w-2.5 h-2.25 bg-blue-900"
                                    style={{ clipPath: 'polygon(100% 0, 0% 100%, 100% 100%)' }}>
                                </div>
                                <div className="relative bg-blue-600 text-white px-2 pb-3 md:px-3 md:pt-3 md:pb-5 text-xs font-bold shadow-md clip-path-bookmark animate-bounce-subtle">
                                    PREVIEW
                                </div>
                            </div>
                            <Swiper
                                modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
                                spaceBetween={20}
                                slidesPerView={1}
                                navigation
                                pagination={pagination}
                                loop={true}
                                autoplay={{ delay: 3000, disableOnInteraction: false }}
                                className="mt-10 shadow-2xl rounded-2xl overflow-hidden aspect-video md:aspect-auto"
                            >
                                <SwiperSlide>
                                    <img src="/example1.png" className="w-full h-full object-cover" alt="Sample 1" />
                                </SwiperSlide>
                                <SwiperSlide>
                                    <img src="/example2.png" className="w-full h-full object-cover" alt="Sample 2" />
                                </SwiperSlide>
                                <SwiperSlide>
                                    <div className="bg-muted flex items-center justify-center h-full text-2xl font-bold">
                                        새로운 협업 경험을 만나보세요
                                    </div>
                                </SwiperSlide>
                            </Swiper>
                        </div>

                        {/* 팀원 소개 섹션 */}
                        <div className="relative mt-24 md:mt-32 w-full">
                            <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center md:text-start">팀원</h2>

                            {/* 데스크탑 배경 붓터치 효과 */}
                            <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-screen h-64 pointer-events-none -rotate-2 z-0 opacity-80">
                                <img src="/paint1.webp" className="w-full h-full object-cover" alt="bg" />
                            </div>

                            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-20 md:gap-10 justify-items-center pb-20">
                                {teamMembers.map((member) => (
                                    <div
                                        key={member.id}
                                        className="mt-16 relative shadow-lg w-64 h-96 border flex items-center flex-col hover:border-blue-500 hover:shadow-blue-200 dark:hover:shadow-blue-900 transition-all duration-300 rounded-xl bg-card group"
                                    >
                                        <div className="absolute -top-10">
                                            <img
                                                src="/universe.jpg"
                                                className="h-24 w-24 rounded-full object-cover border-4 border-background shadow-md group-hover:scale-110 transition-transform"
                                                alt="Profile"
                                            />
                                        </div>
                                        <div className="mt-16 flex items-center flex-col justify-center px-4 text-center">
                                            <h1 className="font-bold text-2xl mt-4">{member.name}</h1>
                                            <p className="font-semibold text-lg text-blue-500">{member.role}</p>
                                            <p className="mt-4 text-sm text-muted-foreground leading-relaxed break-keep">
                                                {member.content}
                                            </p>
                                        </div>
                                        <div className="flex flex-row space-x-6 mt-auto mb-8">
                                            <a href={`mailto:${member.name}@example.com`} className="hover:text-blue-500 transition-colors">
                                                <MailOpen size={20} />
                                            </a>
                                            <a href={member.git} target="_blank" rel="noreferrer" className="hover:text-blue-500 transition-colors">
                                                <Github size={20} />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default IntroductionPage;