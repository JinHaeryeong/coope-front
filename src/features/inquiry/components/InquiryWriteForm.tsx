import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { ImagePlus, X } from "lucide-react";
import { apiCreateInquiry } from "../api/inquiryApi";

const InquiryWriteForm = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("기타");
    const [environment, setEnvironment] = useState("PC");
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const redirectCS = () => navigate("/inquiry");

    useEffect(() => {
        return () => {
            previews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [previews]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const maxFiles = 3;

        if (selectedFiles.length + files.length > maxFiles) {
            toast.error(`최대 ${maxFiles}개까지 업로드 가능합니다.`);
            return;
        }

        const newFiles: File[] = [];
        const newPreviews: string[] = [];

        files.forEach(file => {
            if (!file.type.startsWith('image/')) {
                toast.error(`${file.name}은 이미지가 아닙니다.`);
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`${file.name}은 5MB를 초과합니다.`);
                return;
            }
            newFiles.push(file);
            newPreviews.push(URL.createObjectURL(file));
        });

        setSelectedFiles(prev => [...prev, ...newFiles]);
        setPreviews(prev => [...prev, ...newPreviews]);

        if (e.target) e.target.value = "";
    };

    const handleRemoveFile = (index: number) => {
        URL.revokeObjectURL(previews[index]); // 메모리 해제
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const formData = new FormData();
            formData.append("title", title);
            formData.append("content", content);
            const categoryMap: Record<string, string> = {
                "계정문의": "ACCOUNT", "오류문의": "ERROR", "건의사항": "SUGGESTION", "기타": "ETC"
            };
            formData.append("category", categoryMap[category]);
            formData.append("environment", environment);

            selectedFiles.forEach(file => formData.append("files", file));
            await apiCreateInquiry(formData);

            previews.forEach(url => URL.revokeObjectURL(url));
            toast.success("문의가 등록되었습니다.");
            navigate("/inquiry");
        } catch (error) {
            toast.error("문의 작성에 실패했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <div className="heading text-center font-bold text-4xl m-5">문의</div>
            <form onSubmit={handleSubmit} className="editor mx-auto md:w-11/12 flex flex-col border border-gray-300 p-6 shadow-lg max-w-4xl rounded-lg text-sm md:text-base bg-card">

                <input
                    className="title border border-gray-300 p-2 mb-4 outline-none font-medium rounded-sm focus:ring-1 focus:ring-primary"
                    placeholder="제목"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />

                <div className="flex gap-10 mb-4">
                    <div className="flex flex-col gap-2">
                        <span className="font-normal text-muted-foreground">문의 유형</span>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-40 justify-between">{category}</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-40">
                                <DropdownMenuRadioGroup value={category} onValueChange={setCategory}>
                                    <DropdownMenuRadioItem value="계정문의">계정 문의</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="오류문의">오류 문의</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="건의사항">건의사항</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="기타">기타</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="flex flex-col gap-2">
                        <span className="font-normal text-muted-foreground">발생 환경</span>
                        <RadioGroup value={environment} className="flex gap-4 pt-2" onValueChange={setEnvironment}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="MOBILE" id="r1" />
                                <Label htmlFor="r1">모바일</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="PC" id="r2" />
                                <Label htmlFor="r2">PC</Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>

                <div className="bg-muted/30 p-3 rounded-md mb-4 text-xs space-y-1 text-muted-foreground font-light">
                    <p>• 오류가 발생한 상황이나 궁금한 사항을 상세하게 작성해주세요.</p>
                    <p>• 스크린샷을 첨부해주시면 답변에 큰 도움이 됩니다.</p>
                    <p>• 답변이 달리면 알림 메일이 전송됩니다.</p>
                </div>

                <textarea
                    className="description sec p-3 h-60 border border-gray-300 outline-none resize-none font-medium rounded-sm focus:ring-1 focus:ring-primary"
                    placeholder="문의 내용을 입력하세요."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    maxLength={500}
                />

                <div className="flex items-center justify-between m-2">
                    {/* 세련된 이미지 첨부 버튼 */}
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <ImagePlus size={16} />
                            이미지 추가 ({selectedFiles.length}/3)
                        </Button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*" // 파일 선택창에서 이미지 브라우징만 허용
                            multiple
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>
                    <div className="count text-gray-400 text-xs font-semibold">최대 500자</div>
                </div>

                {/* 미리보기 & 삭제 영역 (댓글 컴포넌트 감성) */}
                <div className="flex flex-wrap gap-3 mt-2 px-1">
                    {previews.map((url, index) => (
                        <div key={index} className="relative group w-24 h-24">
                            <img
                                src={url}
                                alt="preview"
                                className="w-full h-full object-cover rounded-md border shadow-sm"
                            />
                            <button
                                type="button"
                                onClick={() => handleRemoveFile(index)}
                                className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 shadow-md hover:scale-110 transition-transform"
                            >
                                <X size={12} />
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-[10px] text-white truncate px-1 rounded-b-md">
                                {selectedFiles[index]?.name}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="buttons flex mt-6 gap-2">
                    <Button
                        type="button"
                        variant="secondary"
                        className="ml-auto px-6"
                        onClick={redirectCS}
                    >
                        취소
                    </Button>
                    <Button
                        type="submit"
                        className="px-6"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "게시 중..." : "게시"}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default InquiryWriteForm;
