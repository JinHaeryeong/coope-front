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
import { useAuthStore } from "@/store/authStore";
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
        loginModal.onClose(); // 모달 닫기
        navigate("/signup");  // 회원가입 페이지로 이동
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
                <div className="flex gap-x-2">
                    <Button type="submit" className="w-full">로그인</Button>
                </div>
            </FieldGroup>
        </form>
    );
}