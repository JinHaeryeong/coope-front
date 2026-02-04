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

// 회원가입 유효성 검사 스키마
const signupSchema = z.object({
    name: z.string().min(2, "이름은 2자 이상 입력해주세요."),
    nickname: z.string().min(2, "닉네임은 2자 이상 입력해주세요."),
    email: z.string().email("올바른 이메일 형식을 입력해주세요."),
    password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다."),
    confirmPassword: z.string().min(1, "비밀번호 확인을 입력해주세요."),
    userIcon: z.instanceof(File).optional()
}).refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"], // 에러 메시지를 표시할 필드
});

export function SignupForm() {
    const navigate = useNavigate();

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

    const onSubmit = (values: z.infer<typeof signupSchema>) => {
        console.log("백엔드(Spring Boot)로 보낼 데이터:", values);
        // TODO: axios.post("/api/auth/signup", values)
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
            <FieldGroup className="lg:space-y-2">
                {/* 이름 필드 */}
                <Field>
                    <FieldLabel>이름</FieldLabel>
                    <Input {...form.register("name")} placeholder="홍길동" />
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
                            if (file) form.setValue("userIcon", file);
                        }}
                    />
                    <FieldDescription>나를 표현할 사진을 선택해주세요. (로컬 서버에 저장됩니다.)</FieldDescription>
                </Field>
                {/* 닉네임 필드 */}
                <Field>
                    <FieldLabel>닉네임</FieldLabel>
                    <Input {...form.register("nickname")} placeholder="닉네임" />
                    {form.formState.errors.nickname && (
                        <p className="text-xs text-red-500 mt-1">{form.formState.errors.nickname.message}</p>
                    )}
                </Field>

                {/* 이메일 필드 */}
                <Field>
                    <FieldLabel>이메일</FieldLabel>
                    <Input {...form.register("email")} type="email" placeholder="example@coope.com" />
                    <FieldDescription>로그인 시 사용할 이메일 주소입니다.</FieldDescription>
                    {form.formState.errors.email && (
                        <p className="text-xs text-red-500 mt-1">{form.formState.errors.email.message}</p>
                    )}
                </Field>

                {/* 비밀번호 필드 */}
                <Field>
                    <FieldLabel>비밀번호</FieldLabel>
                    <Input {...form.register("password")} type="password" placeholder="••••••••" />
                    {form.formState.errors.password && (
                        <p className="text-xs text-red-500 mt-1">{form.formState.errors.password.message}</p>
                    )}
                </Field>

                {/* 비밀번호 확인 필드 */}
                <Field>
                    <FieldLabel>비밀번호 확인</FieldLabel>
                    <Input {...form.register("confirmPassword")} type="password" placeholder="••••••••" />
                    {form.formState.errors.confirmPassword && (
                        <p className="text-xs text-red-500 mt-1">{form.formState.errors.confirmPassword.message}</p>
                    )}
                </Field>

                <div className="flex flex-col gap-y-4 pt-4">
                    <Button type="submit" className="w-full" size="lg">
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