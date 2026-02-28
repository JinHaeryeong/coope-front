import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { apiVerifyPassword, apiUpdateProfile } from "@/api/userApi";
import axios from "axios";
import { UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

const profileSchema = z.object({
    nickname: z.string()
        .min(2, "닉네임은 2자 이상이어야 합니다.")
        .max(20, "닉네임은 20자 이내로 입력해주세요."),
    newPassword: z.string()
        .optional()
        .or(z.literal(""))
        .refine((val) => !val || (val.length >= 8 && val.length <= 20), {
            message: "비밀번호는 8자 이상 20자 이하로 입력해주세요.",
        })
        .refine((val) => !val || passwordRegex.test(val), {
            message: "비밀번호는 영어, 숫자, 특수문자를 포함해야 합니다.",
        }),
    confirmPassword: z.string().optional().or(z.literal("")),
}).superRefine(({ newPassword, confirmPassword }, ctx) => {
    if (newPassword && newPassword !== confirmPassword) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "새 비밀번호가 일치하지 않습니다.",
            path: ["confirmPassword"],
        });
    }
});


export const ProfilePage = () => {
    const { user, updateUser } = useAuthStore();
    const isSocialUser = user?.provider !== "LOCAL" && user?.provider !== null;
    const [isVerified, setIsVerified] = useState(isSocialUser);
    const [verifyInput, setVerifyInput] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isImageDeleted, setIsImageDeleted] = useState(false);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (!selectedFile) {
            setPreviewUrl(null);
            return;
        }

        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);

        return () => URL.revokeObjectURL(url);
    }, [selectedFile]);

    const handleVerify = async () => {
        if (!verifyInput) {
            toast.error("비밀번호를 입력해주세요.");
            return;
        }
        try {
            await apiVerifyPassword(verifyInput);
            setIsVerified(true);
            toast.success("본인 인증에 성공했습니다.");
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status;
                const serverMessage = (error.response?.data as any)?.message || error.message;
                if (status === 401) {
                    toast.error("세션이 만료되었습니다. 다시 로그인해주세요.");
                    navigate("/");
                } else if (status === 400 || status === 403) {
                    toast.error(serverMessage || "비밀번호가 일치하지 않습니다.");
                } else {
                    toast.error(serverMessage || "본인 인증 중 오류가 발생했습니다.");
                }
            } else {
                toast.error("예상치 못한 에러가 발생했습니다.");
            }
        }
    };

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            nickname: user?.nickname || "",
            newPassword: "",
        },
    });


    const handleDeleteImage = () => {
        setSelectedFile(null);
        setIsImageDeleted(true);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const onSubmit = async (values: z.infer<typeof profileSchema>) => {
        try {
            const formData = new FormData();

            formData.append("nickname", values.nickname);

            formData.append("deleteProfileImage", String(isImageDeleted));

            if (selectedFile) {
                formData.append("profileImage", selectedFile);
            }

            if (values.newPassword) {
                formData.append("currentPassword", verifyInput);
                formData.append("newPassword", values.newPassword);
            }

            const updatedUser = await apiUpdateProfile(formData);

            updateUser(updatedUser);

            toast.success("프로필이 성공적으로 수정되었습니다.");


            setIsImageDeleted(false);
            form.reset({ nickname: updatedUser.nickname, newPassword: "" });
            setTimeout(() => {
                navigate("/");
            }, 1000);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const serverMessage = error.response?.data?.message;
                toast.error(serverMessage || "수정 중 오류가 발생했습니다.");
            } else {
                toast.error("예상치 못한 에러가 발생했습니다.");
            }
        }
    };

    if (!isVerified) {
        return (
            <div className="flex-1 flex items-center justify-center p-6">
                <Card className="w-full max-w-md shadow-lg border-2">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">보안 확인</CardTitle>
                        <CardDescription>정보 수정을 위해 현재 비밀번호를 입력해주세요.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            type="password"
                            placeholder="현재 비밀번호 입력"
                            value={verifyInput}
                            onChange={(e) => setVerifyInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                            autoFocus
                            maxLength={20}
                        />
                        <Button className="w-full" onClick={handleVerify}>본인 확인</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="lg:max-w-4/6 mx-auto py-12 px-2 md:px-6 w-full animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold mb-8">내 정보 설정</h1>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardContent className="pt-6 space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-muted-foreground">이메일 계정</label>
                            <Input value={user?.email} disabled className="bg-secondary/50 cursor-not-allowed" />
                            <p className="text-[10px] text-muted-foreground">이메일은 변경할 수 없습니다.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">프로필 이미지</label>
                            <div className="flex items-center gap-x-6">
                                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-muted bg-secondary flex items-center justify-center">
                                    {previewUrl ? (
                                        <img
                                            src={previewUrl}
                                            className="w-full h-full object-cover"
                                            alt="Preview"
                                        />
                                    ) : (user?.userIcon && !isImageDeleted) ? (
                                        <img
                                            src={user.userIcon}
                                            className="w-full h-full object-cover"
                                            alt="Profile"
                                        />
                                    ) : (
                                        <UserCircle className="w-20 h-20 text-muted-foreground/60" strokeWidth={1.5} />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <Input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                if (file.size > 10 * 1024 * 1024) {
                                                    toast.error("10MB 이하만 가능합니다.");
                                                    return;
                                                }
                                                setSelectedFile(file);
                                                setIsImageDeleted(false);
                                            }
                                        }}
                                        className="cursor-pointer"
                                    />
                                    {(user?.userIcon || selectedFile) && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="text-xs text-destructive border-destructive hover:bg-destructive/10"
                                            onClick={handleDeleteImage}
                                        >
                                            이미지 삭제
                                        </Button>
                                    )}
                                    <p className="text-[11px] text-muted-foreground mt-2">
                                        추천 크기: 200x200px (JPG, PNG, WebP) (10MB까지만)
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold">닉네임</label>
                            <Input
                                {...form.register("nickname")}
                                placeholder="사용할 닉네임을 입력하세요"
                                maxLength={20}
                            />
                            {form.formState.errors.nickname && (
                                <p className="text-xs text-destructive font-medium">{form.formState.errors.nickname.message}</p>
                            )}
                        </div>

                        <div className="space-y-4 border-t pt-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">새 비밀번호</label>
                                <Input
                                    type="password"
                                    {...form.register("newPassword")}
                                    placeholder="변경할 경우에만 8자 이상 입력"
                                    maxLength={20}
                                />
                                {form.formState.errors.newPassword && (
                                    <p className="text-xs text-destructive font-medium">{form.formState.errors.newPassword.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold">새 비밀번호 확인</label>
                                <Input
                                    type="password"
                                    {...form.register("confirmPassword")}
                                    placeholder="새 비밀번호를 한 번 더 입력하세요"
                                    maxLength={20}
                                />
                                {form.formState.errors.confirmPassword && (
                                    <p className="text-xs text-destructive font-medium">{form.formState.errors.confirmPassword.message}</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex gap-4">
                    <Button type="submit" className="flex-1 text-lg py-6" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "저장 중..." : "설정 저장"}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ProfilePage;