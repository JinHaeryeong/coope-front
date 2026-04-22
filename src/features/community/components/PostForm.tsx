import { useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { apiFileUpload } from "@/api/fileApi";
import { toast } from "sonner";
import type { PostCreateRequest, PostCategory } from "../types/posts";

interface PostFormProps {
    onSubmit: (data: PostCreateRequest) => void;
}

export const PostForm = ({ onSubmit }: PostFormProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [activeTab, setActiveTab] = useState("write");

    const [techInput, setTechInput] = useState("");
    const [tags, setTags] = useState<string[]>([]);

    const { register, handleSubmit, watch, setValue, formState: { isSubmitting } } = useForm<PostCreateRequest>({
        defaultValues: {
            category: "GENERAL",
            title: "",
            content: "",
            targetMembers: 2,
            techStack: "",
        }
    });

    const category = watch("category");
    const content = watch("content");

    const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const cleanValue = techInput.replace(/[^a-zA-Z0-9가-힣+#]/g, "").trim();

            if (cleanValue && !tags.includes(cleanValue)) {
                const newTags = [...tags, cleanValue];
                setTags(newTags);
                setValue("techStack", newTags.join(","));
            }
            setTechInput("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        const newTags = tags.filter((tag) => tag !== tagToRemove);
        setTags(newTags);
        setValue("techStack", newTags.join(","));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const data = await apiFileUpload(file, "COMMUNITY");
            const imageUrl = data.fileUrl || data.url || data;

            if (!imageUrl || typeof imageUrl === 'object') {
                throw new Error("이미지 URL 추출 실패");
            }

            const markdownImage = `\n![image](${imageUrl})\n`;
            setValue("content", content + markdownImage);
            toast.success("이미지가 본문에 삽입되었습니다.");
        } catch (error) {
            toast.error("이미지 업로드 실패");
            console.error(error);
        } finally {
            setIsUploading(false);
            if (e.target) e.target.value = "";
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="editor mx-auto w-full flex flex-col border border-gray-200 dark:border-neutral-800 p-4 md:p-6 shadow-lg max-w-4xl rounded-lg bg-card text-card-foreground space-y-4 md:space-y-6"
        >
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-start md:items-center">
                <div className="flex flex-col gap-1.5 w-full md:w-auto">
                    <span className="text-xs md:text-sm font-medium text-muted-foreground ml-1">카테고리</span>
                    <Select
                        defaultValue="GENERAL"
                        onValueChange={(value) => setValue("category", value as PostCategory)}
                    >
                        <SelectTrigger className="w-full md:w-40 border-gray-300 dark:border-neutral-700 h-10 bg-transparent">
                            <SelectValue placeholder="카테고리" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-neutral-900">
                            <SelectItem value="GENERAL">자유</SelectItem>
                            <SelectItem value="RECRUITMENT">모집</SelectItem>
                            <SelectItem value="QNA">질문</SelectItem>
                            <SelectItem value="SHOWCASE">자랑</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex-1 w-full flex flex-col gap-1.5">
                    <span className="text-xs md:text-sm font-medium text-muted-foreground ml-1">글 제목</span>
                    <Input
                        {...register("title", { required: true })}
                        placeholder="제목을 입력하세요"
                        required
                        className="h-10 border-gray-300 dark:border-neutral-700 bg-transparent focus:ring-1 focus:ring-primary"
                    />
                </div>
            </div>

            {category === "RECRUITMENT" && (
                <div className="flex flex-col gap-5 p-4 border rounded-lg bg-blue-50/20 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
                    <div className="space-y-2.5">
                        <label className="text-xs md:text-sm font-semibold text-blue-800 dark:text-blue-300">
                            기술 스택 <span className="font-normal opacity-70">(쉼표/엔터 입력)</span>
                        </label>
                        <div className="flex flex-wrap gap-1.5 min-h-6">
                            {tags.map((tag) => (
                                <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-900/60 py-0.5 px-2 text-[10px] md:text-xs border-none"
                                >
                                    {tag}
                                    <X size={12} className="cursor-pointer" onClick={() => removeTag(tag)} />
                                </Badge>
                            ))}
                        </div>
                        <Input
                            value={techInput}
                            onChange={(e) => setTechInput(e.target.value)}
                            onKeyDown={handleTagInput}
                            placeholder="Java, Spring, React..."
                            className="h-10 border-blue-200 dark:border-blue-900/50 bg-white dark:bg-neutral-900/50 focus:ring-blue-500"
                        />
                    </div>

                    {/* 모집 인원 */}
                    <div className="space-y-2.5">
                        <label className="text-xs md:text-sm font-semibold text-blue-800 dark:text-blue-300">
                            모집 인원 <span className="font-normal opacity-70">(본인 포함)</span>
                        </label>
                        <div className="max-w-50">
                            <Select
                                defaultValue="2"
                                onValueChange={(v) => setValue("targetMembers", Number(v))}
                            >
                                <SelectTrigger className="w-full h-10 border-blue-200 dark:border-blue-900/50 bg-white dark:bg-neutral-900/50">
                                    <SelectValue placeholder="인원 선택" />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-neutral-900">
                                    {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                        <SelectItem key={num} value={num.toString()}>{num}명</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <p className="text-[10px] text-blue-500/80 dark:text-blue-400/60 ml-0.5 italic">* 2인 이상 10인 이하만 가능합니다.</p>
                    </div>
                </div>
            )}

            {/* 3. 에디터 탭바 */}
            <div className="flex flex-col gap-2.5">
                <div className="flex justify-between items-center px-1">
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 text-[10px] md:text-xs gap-1.5 border-gray-300 dark:border-neutral-700 bg-transparent hover:bg-muted"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                        >
                            {isUploading ? <Loader2 size={12} className="animate-spin" /> : <ImagePlus size={12} />}
                            사진 추가
                        </Button>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-fit">
                        <TabsList className="h-8 bg-muted/50 dark:bg-neutral-800/50">
                            <TabsTrigger value="write" className="text-[10px] md:text-xs px-3">Write</TabsTrigger>
                            <TabsTrigger value="preview" className="text-[10px] md:text-xs px-3">Preview</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="w-full min-h-80 md:min-h-125 border border-gray-300 dark:border-neutral-700 rounded-md overflow-hidden flex flex-col bg-background">
                    {activeTab === "write" ? (
                        <Textarea
                            {...register("content", { required: true })}
                            value={content}
                            onChange={(e) => setValue("content", e.target.value)}
                            placeholder="마크다운 형식으로 자유롭게 작성하세요."
                            className="flex-1 w-full p-4 border-none focus-visible:ring-0 resize-none font-mono text-sm md:text-base leading-relaxed bg-transparent"
                        />
                    ) : (
                        <div className="flex-1 p-4 md:p-6 bg-slate-50/50 dark:bg-neutral-900/30 overflow-y-auto prose prose-sm md:prose-base prose-slate dark:prose-invert max-w-none prose-p:my-1 prose-pre:bg-neutral-800 dark:prose-pre:bg-black wrap-break-word">
                            {content ? (
                                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                                    {content}
                                </ReactMarkdown>
                            ) : (
                                <p className="text-xs md:text-sm text-muted-foreground italic text-center pt-20">
                                    내용을 입력하면 여기에 미리보기가 표시됩니다.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* 5. 하단 액션 버튼 */}
            <div className="flex flex-row justify-end gap-3 border-t border-gray-200 dark:border-neutral-800 pt-5">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => window.history.back()}
                    className="flex-1 md:flex-none h-10 px-6 text-xs md:text-sm hover:bg-muted"
                >
                    취소
                </Button>
                <Button
                    type="submit"
                    disabled={isSubmitting || isUploading}
                    className="flex-1 md:flex-none h-10 px-10 text-xs md:text-sm font-semibold shadow-sm"
                >
                    {isSubmitting ? "등록 중..." : "등록"}
                </Button>
            </div>
        </form>
    );
};