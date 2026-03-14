import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { apiUnlockAccount, apiResetPassword } from "@/api/userApi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

const schema = z.object({
    newPassword: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다."),
    confirmPassword: z.string().min(8, "비밀번호 확인을 입력해주세요."),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
});

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [resetToken, setResetToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const unlockTokenParam = searchParams.get("unlockToken");
    const resetTokenParam = searchParams.get("resetToken");

    useEffect(() => {
        if (!unlockTokenParam && !resetTokenParam) {
            toast.error("유효하지 않은 접근입니다.");
            navigate("/");
            return;
        }

        if (resetTokenParam) {
            setResetToken(resetTokenParam);
            setIsLoading(false);
            return;
        }

        const verifyUnlockToken = async () => {
            try {
                const response = await apiUnlockAccount(unlockTokenParam!);
                setResetToken(response.resetToken);
            } catch (error) {
                toast.error("만료되었거나 유효하지 않은 인증 링크입니다.");
                navigate("/find-account");
            } finally {
                setIsLoading(false);
            }
        };

        if (unlockTokenParam) {
            verifyUnlockToken();
        }
    }, [unlockTokenParam, resetTokenParam, navigate]);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (values: z.infer<typeof schema>) => {
        if (!resetToken) {
            toast.error("인증이 만료되었습니다. 다시 시도해주세요.");
            navigate("/find-account");
            return;
        }

        try {
            await apiResetPassword({
                resetToken,
                newPassword: values.newPassword,
            });
            toast.success("비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.");
            navigate("/"); // 로그인 모달이 메인에서 뜨도록 유도하거나 로그인 페이지로 이동
        } catch (error: any) {
            toast.error(error.response?.data?.message || "비밀번호 재설정에 실패했습니다.");
        }
    };

    if (isLoading) return <div className="flex justify-center mt-40"><Spinner /></div>;

    return (
        <div className="max-w-xl m-auto mt-20 p-10 border rounded-2xl shadow-lg bg-white">
            <h1 className="text-2xl font-bold mb-2 text-center text-slate-800">새 비밀번호 설정</h1>
            <p className="text-sm text-center text-muted-foreground mb-8">
                새로운 비밀번호를 입력하여 계정 보안을 유지하세요.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Field>
                    <FieldLabel className="text-base font-semibold">새 비밀번호</FieldLabel>
                    <Input
                        {...register("newPassword")}
                        type="password"
                        className="h-12"
                        placeholder="8자 이상의 새 비밀번호"
                    />
                    {errors.newPassword && <p className="text-xs text-red-500 mt-1">{errors.newPassword.message}</p>}
                </Field>

                <Field>
                    <FieldLabel className="text-base font-semibold">비밀번호 확인</FieldLabel>
                    <Input
                        {...register("confirmPassword")}
                        type="password"
                        className="h-12"
                        placeholder="비밀번호를 한 번 더 입력"
                    />
                    {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
                </Field>

                <Button type="submit" className="w-full h-12 text-sm font-bold" disabled={isSubmitting || !resetToken}>
                    비밀번호 변경하기
                </Button>
            </form>
        </div>
    );
}