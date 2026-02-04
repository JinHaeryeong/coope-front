export const Logo = () => {
    return (
        <div className="flex items-center gap-x-2">
            {/* 라이트 모드 로고 */}
            <img
                src="/logo.webp"
                height="200"
                width="200"
                alt="logo"
                // loading="eager"와 fetchpriority="high"로 넥스트의 priority 기능 흉내내기
                loading="eager"
                style={{ fetchPriority: "high" } as any}
                className="dark:hidden"
            />
            {/* 다크 모드 로고 */}
            <img
                src="/logo-dark.webp"
                height="200"
                width="200"
                alt="logo"
                loading="eager"
                className="hidden dark:block"
            />
        </div>
    )
}