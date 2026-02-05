
export const Logo = () => {


    return (
        <div className="flex items-center gap-x-2">
            {/* 라이트 모드 로고 */}
            <img
                src="/logo.webp"
                height="200"
                width="200"
                alt="logo"
                loading="eager"
                {...{ fetchpriority: "high" }}
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