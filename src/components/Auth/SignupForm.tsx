import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Field,
    FieldLabel,
    FieldGroup,
    FieldDescription
} from "@/components/ui/field";
import { apiSendEmail, apiSignUp, apiVerifyEmail } from "@/api/userApi";
import axios from "axios";
import { toast } from "sonner";
import { useEffect, useState } from "react";


const nicknameRegex = /^[a-zA-Z0-9가-힣]{2,20}$/;
const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;


// 회원가입 유효성 검사 스키마
const signupSchema = z.object({
    name: z
        .string()
        .min(2, "이름은 2자 이상 입력해주세요.")
        .max(20, "이름은 10자 이내로 입력해주세요."),
    nickname: z
        .string()
        .min(2, "닉네임은 2자 이상 입력해주세요.")
        .max(20, "닉네임은 10자 이내로 입력해주세요.")
        .regex(nicknameRegex, "닉네임은 특수문자를 제외한 한글, 영문, 숫자만 가능합니다."),
    email: z.string().email("올바른 이메일 형식을 입력해주세요."),
    password: z.string().min(8, "비밀번호는 최소 8자 이상 20자 이하이어야 합니다.").regex(
        passwordRegex,
        "비밀번호는 영어, 숫자, 특수문자를 포함해야 합니다."
    ),
    confirmPassword: z.string().min(1, "비밀번호 확인을 입력해주세요."),
    userIcon: z.instanceof(File).optional()
}).refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"], // 에러 메시지를 표시할 필드
});

export function SignupForm() {
    const navigate = useNavigate();

    const [isEmailSent, setIsEmailSent] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [authCode, setAuthCode] = useState("");

    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const form = useForm<z.infer<typeof signupSchema>>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            name: "",
            nickname: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? `0${s}` : s}`;
    };

    const handleSendCode = async () => {
        const email = form.getValues("email");
        if (!email || form.formState.errors.email) {
            toast.error("올바른 이메일을 입력해주세요.");
            return;
        }
        try {
            await apiSendEmail(email);
            setIsEmailSent(true);
            setTimeLeft(300);
            toast.success("인증번호가 발송되었습니다!");
        } catch (error) {
            toast.error("메일 발송에 실패했습니다.");
        }
    };

    const handleVerifyCode = async () => {
        const email = form.getValues("email");
        try {
            await apiVerifyEmail(email, authCode);
            setIsVerified(true);
            toast.success("이메일 인증 성공!");
        } catch (error) {
            toast.error("인증번호가 틀렸거나 만료되었습니다.");
        }
    };

    const onSubmit = async (values: z.infer<typeof signupSchema>) => {
        if (!isVerified) {
            toast.error("이메일 인증을 먼저 완료해주세요.");
            return;
        }
        try {
            const formData = new FormData();

            // 데이터 밀어넣기
            formData.append("name", values.name);
            formData.append("nickname", values.nickname);
            formData.append("email", values.email);
            formData.append("password", values.password);

            if (values.userIcon instanceof File) {
                formData.append("userIcon", values.userIcon);
            }
            const result = await apiSignUp(formData);

            // 전용 API 호출
            if (result) {
                console.log("서버 응답 데이터:", result);
                toast.success(result.message || "회원가입 성공!");

                // 가입 성공 후 로그인 페이지로 리다이렉트
                navigate("/");
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const serverMessage = error.response?.data?.message;
                toast.error(serverMessage || "회원가입 중 오류가 발생했습니다.");
            } else {
                console.error("알 수 없는 에러:", error);
            }
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
            <FieldGroup className="lg:space-y-2">
                {/* 이름 필드 */}
                <Field>
                    <FieldLabel>이름</FieldLabel>
                    <Input {...form.register("name")}
                        placeholder="홍길동 (최대 20자)"
                        maxLength={20} />
                    {form.formState.errors.name && (
                        <p className="text-xs text-red-500 mt-1">{form.formState.errors.name.message}</p>
                    )}
                </Field>


                <Field>
                    <FieldLabel>프로필 이미지</FieldLabel>
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                form.setValue("userIcon", file);
                            } else {
                                form.setValue("userIcon", undefined);
                            }
                        }}
                    />
                    <FieldDescription>나를 표현할 사진을 선택해주세요</FieldDescription>
                </Field>
                {/* 닉네임 필드 */}
                <Field>
                    <FieldLabel>닉네임</FieldLabel>
                    <Input {...form.register("nickname")}
                        placeholder="닉네임 (최대 20자)"
                        maxLength={20} />
                    {form.formState.errors.nickname && (
                        <p className="text-xs text-red-500 mt-1">{form.formState.errors.nickname.message}</p>
                    )}
                </Field>

                {/* 이메일 필드 */}
                <Field>
                    <FieldLabel>이메일</FieldLabel>
                    <div className="flex gap-2">
                        <Input {...form.register("email")}
                            disabled={isVerified}
                            type="email" placeholder="example@coope.com" />
                        <Button type="button" variant="outline"
                            onClick={handleSendCode}
                            disabled={isVerified}>
                            {isEmailSent ? "재발송" : "인증번호 발송"}
                        </Button>
                    </div>
                    {form.formState.errors.email && (
                        <p className="text-xs text-red-500 mt-1">{form.formState.errors.email.message}</p>
                    )}
                </Field>

                {isEmailSent && !isVerified && (
                    <Field>
                        <div className="flex justify-between items-center">
                            <FieldLabel>인증번호</FieldLabel>
                            {timeLeft > 0 ? (
                                <span className="text-xs font-medium text-red-500">
                                    남은 시간 {formatTime(timeLeft)}
                                </span>
                            ) : (
                                <span className="text-xs font-medium text-red-500">인증 시간이 만료되었습니다.</span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Input value={authCode}
                                onChange={(e) => setAuthCode(e.target.value)}
                                placeholder="6자리 번호 입력"
                                disabled={timeLeft <= 0} // 시간 다 되면 입력 막기
                            />
                            <Button type="button" onClick={handleVerifyCode} disabled={timeLeft <= 0}>확인</Button>
                        </div>
                    </Field>
                )}

                {isVerified && <p className="text-xs text-green-500">이메일 인증이 완료되었습니다</p>}

                {/* 비밀번호 필드 */}
                <Field>
                    <FieldLabel>비밀번호</FieldLabel>
                    <Input {...form.register("password")} type="password" placeholder="••••••••" maxLength={20} />
                    {form.formState.errors.password && (
                        <p className="text-xs text-red-500 mt-1">{form.formState.errors.password.message}</p>
                    )}
                </Field>

                {/* 비밀번호 확인 필드 */}
                <Field>
                    <FieldLabel>비밀번호 확인</FieldLabel>
                    <Input {...form.register("confirmPassword")} type="password" placeholder="••••••••" maxLength={20} />
                    {form.formState.errors.confirmPassword && (
                        <p className="text-xs text-red-500 mt-1">{form.formState.errors.confirmPassword.message}</p>
                    )}
                </Field>

                <div className="flex flex-col gap-y-4 pt-4">
                    <Button type="submit" className="w-full cursor-pointer" size="lg">
                        계정 생성하기
                    </Button>
                    <div className="flex flex-1 items-center justify-center">
                        <div className="text-gray-500">이미 계정이 있으신가요?</div>
                        <span
                            className="ml-2 text-primary underline underline-offset-4 cursor-pointer hover:text-primary/80 transition"
                            onClick={() => navigate("/")}
                        >
                            돌아가기
                        </span>
                    </div>
                </div>
            </FieldGroup>
        </form>
    );
}