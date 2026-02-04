
export const Heroes = () => {
    return (
        <div className="flex flex-col items-center justify-center max-w-5xl">
            <div className="flex items-center">
                {/* 첫 번째 이미지 박스 */}
                <div className="relative w-75 h-75 sm:w-87.5 sm:h-87.5 md:h-100 md:w-100">
                    <img
                        src="/documents.webp"
                        className="object-contain dark:hidden w-full h-full"
                        alt="Documents"
                    />
                    <img
                        src="/documents-dark.webp"
                        className="object-contain hidden dark:block w-full h-full"
                        alt="Documents"
                    />
                </div>

                {/* 두 번째 이미지 박스 (데스크톱 전용) */}
                <div className="relative h-100 w-100 hidden md:block">
                    <img
                        src="/reading.webp"
                        className="object-contain dark:hidden w-full h-full"
                        alt="Reading"
                    />
                    <img
                        src="/reading-dark.webp"
                        className="object-contain hidden dark:block w-full h-full"
                        alt="Reading"
                    />
                </div>
            </div>
        </div>
    );
};