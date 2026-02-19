
export const Heroes = () => {
    return (
        <div className="flex flex-col items-center justify-center max-w-5xl w-full">
            <div className="flex items-center justify-center w-full">
                <div className="relative w-full max-w-sm aspect-square max-h-[45vh]">

                    <img
                        src="/documents.webp"
                        className="object-contain dark:hidden w-full h-full"
                        fetchPriority="high"
                        width="427"
                        height="320"
                        alt="Documents"
                    />
                    <img
                        src="/documents-dark.webp"
                        className="object-contain hidden dark:block w-full h-full"
                        alt="Documents"
                    />
                </div>

                <div className="relative w-full max-w-sm aspect-square max-h-[45vh] hidden md:block">
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