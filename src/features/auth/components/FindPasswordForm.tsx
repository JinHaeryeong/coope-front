import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { apiFindPassword } from "../api/userApi";
import { toast } from "sonner";

const schema = z.object({
    name: z.string().min(1, "이름을 입력해주세요."),
    email: z.string().email("올바른 이메일 형식을 입력해주세요."),
});

export function FindPasswordForm() {
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (values: z.infer<typeof schema>) => {
        try {
            await apiFindPassword(values);
            toast.success("비밀번호 재설정 메일을 보냈습니다. 메일함을 확인해주세요.");
            reset();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "메일 발송에 실패했습니다.");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field>
                <FieldLabel>이름</FieldLabel>
                <Input {...register("name")} placeholder="가입 시 등록한 이름" />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </Field>
            <Field>
                <FieldLabel>이메일</FieldLabel>
                <Input {...register("email")} placeholder="가입 시 등록한 이메일" />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </Field>
            <Button type="submit" className="w-full" disabled={isSubmitting}>재설정 메일 발송</Button>
            <p className="text-[11px] text-muted-foreground text-center">
                * 메일이 오지 않는다면 스팸 메일함을 확인해주세요.
            </p>
        </form>
    );
}
