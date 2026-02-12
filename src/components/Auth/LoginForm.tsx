import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { useNavigate } from "react-router-dom";
import { useLoginModal } from "@/hooks/useLoginModal";
import axios from "axios";
import { apiLogin } from "@/api/userApi";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

// 유효성 검사 규칙 정의
const formSchema = z.object({
    email: z.string().email("올바른 이메일을 입력해주세요."),
    password: z.string().min(8, "비밀번호는 최소 8자 이상입니다."),
});

export function LoginForm() {

    const navigate = useNavigate();
    const loginModal = useLoginModal();
    const { signIn } = useAuthStore();
    // 폼 초기화
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { email: "", password: "" },
    });

    const handleGoogleLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_BASE_URL}/oauth2/authorization/google`;
    };



    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const result = await apiLogin(values);

            if (result) {
                const { accessToken, ...userInfo } = result;
                signIn(accessToken, userInfo);

                console.log("로그인 성공 및 스토어 저장 완료");

                loginModal.onClose();
                navigate("/");
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const serverMessage = error.response?.data?.message;
                toast.info(serverMessage || "로그인에 실패했습니다.");
            } else {
                console.error("알 수 없는 에러:", error);
            }
        }
    };

    const handleSignupClick = () => {
        loginModal.onClose();
        navigate("/signup");
    };

    const handleSocialLogin = (provider: string) => {
        toast.info("아직 없서영" + provider);
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
                <Field>
                    <FieldLabel>이메일</FieldLabel>
                    <Input
                        {...form.register("email")}
                        placeholder="name@example.com"
                    />
                    {form.formState.errors.email && (
                        <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
                    )}
                </Field>

                <Field>
                    <FieldLabel>비밀번호</FieldLabel>
                    <Input
                        type="password"
                        {...form.register("password")}
                        placeholder="••••••••"
                    />
                    {form.formState.errors.password && (
                        <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
                    )}
                </Field>
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                        계정이 없으신가요?
                        <span
                            className="ml-2 text-primary underline underline-offset-4 cursor-pointer hover:text-primary/80 transition"
                            onClick={handleSignupClick}
                        >
                            회원가입
                        </span>
                    </p>
                </div>
                <div className="flex flex-col gap-y-3">
                    <Button type="submit" className="w-full cursor-pointer">로그인</Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full cursor-pointer flex gap-x-2 border-slate-200"
                        onClick={handleGoogleLogin}
                    >
                        <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google로 계속하기
                    </Button>
                    <Button
                        type="button"
                        className="w-full cursor-pointer flex gap-x-2 bg-[#FEE500] text-[#191919] hover:bg-[#FEE500]/90 border-none"
                        onClick={() => handleSocialLogin('kakao')}
                    >
                        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 3C5.13431 3 2 5.3134 2 8.16667C2 10.0125 3.29175 11.6217 5.21667 12.5567L4.3975 15.6017C4.35625 15.7525 4.45333 15.9058 4.60417 15.9325C4.66417 15.9433 4.72583 15.9383 4.78167 15.9183L8.43417 13.5258C8.61917 13.5358 8.8075 13.5417 9 13.5417C12.8657 13.5417 16 11.2283 16 8.375C16 5.5216 12.8657 3.2083 9 3.2083V3Z" fill="currentColor" />
                        </svg>
                        카카오로 시작하기
                    </Button>

                    {/* 네이버 버튼 */}
                    <Button
                        type="button"
                        className="w-full cursor-pointer flex gap-x-2 bg-[#03C755] text-white hover:bg-[#03C755]/90 border-none"
                        onClick={() => handleSocialLogin('naver')}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.2241 8.24272L6.1511 2.37344H2.43555V13.6266H5.77589V7.75728L9.8489 13.6266H13.5644V2.37344H10.2241V8.24272Z" fill="white" />
                        </svg>
                        네이버로 시작하기
                    </Button>
                </div>
            </FieldGroup>
        </form>
    );
}