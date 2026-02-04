// src/pages/Marketing/SignupPage.tsx
import { SignupForm } from "@/components/Auth/SignupForm";

const SignupPage = () => {
    return (
        <div className="flex-1 flex items-center justify-center bg-background py-12 p-1 lg:px-8">

            <div className="relative lg:max-w-4/6 w-full space-y-8 bg-card p-8 rounded-2xl border shadow-sm">
                <img
                    src="/signup.webp"
                    alt="waving girl"
                    className="
        absolute
        -left-62
        top-1/2
        -translate-y-1/2
        hidden lg:block
        w-70
        pointer-events-none
      "
                />
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">
                        회원가입
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        coope와 함께 시작해보세요
                    </p>
                </div>
                {/* 회원가입 폼 컴포넌트 */}
                <SignupForm />
            </div>
        </div>
    );
};

export default SignupPage;