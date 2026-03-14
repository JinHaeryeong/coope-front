import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { apiFindEmail, type FindEmailResponse } from "@/api/userApi";
import { toast } from "sonner";

const schema = z.object({
    name: z.string().min(1, "이름을 입력해주세요."),
    nickname: z.string().min(1, "닉네임을 입력해주세요."),
});

export function FindEmailForm() {
    const [results, setResults] = useState<FindEmailResponse[] | null>(null);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (values: z.infer<typeof schema>) => {
        try {
            const data = await apiFindEmail(values);
            setResults(data);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "정보를 찾을 수 없습니다.");
        }
    };

    if (results) {
        return (
            <div className="space-y-4 animate-in fade-in duration-500">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-sm font-medium mb-2 text-slate-600">찾으시는 계정 정보입니다:</p>
                    {results.length > 0 ? (
                        results.map((user) => (
                            <div key={`${user.maskedEmail}-${user.provider}`} className="flex justify-between py-2 border-b last:border-0">
                                <span className="font-mono text-blue-600">{user.maskedEmail}</span>
                                <span className="text-xs text-slate-400 bg-slate-200 px-2 py-1 rounded">{user.provider}</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-center py-4">일치하는 계정이 없습니다.</p>
                    )}
                </div>
                <Button variant="outline" className="w-full" onClick={() => setResults(null)}>다시 시도</Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field>
                <FieldLabel>이름</FieldLabel>
                <Input {...register("name")} placeholder="가입 시 등록한 이름" />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </Field>
            <Field>
                <FieldLabel>닉네임</FieldLabel>
                <Input {...register("nickname")} placeholder="가입 시 등록한 닉네임" />
                {errors.nickname && <p className="text-xs text-red-500">{errors.nickname.message}</p>}
            </Field>
            <Button type="submit" className="w-full" disabled={isSubmitting}>이메일 찾기</Button>
        </form>
    );
}