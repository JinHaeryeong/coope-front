import React, { useRef, useState, useMemo, useEffect } from "react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { apiGetNoticeById, apiEditNotice } from "@/api/noticeApi"; // API 추가
import { toast } from "sonner";
import { Smile, Paperclip, X, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";

interface EmojiData {
    native: string;
    [key: string]: any;
}


const NoticeEditPage = () => {
    const { id } = useParams<{ id: string }>(); // URL에서 ID 가져오기
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const fileInput = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
    const [isImageDeletedFlag, setIsImageDeletedFlag] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const fetchNotice = async () => {
            if (!id) return;
            try {
                const data = await apiGetNoticeById(Number(id));
                setTitle(data.title);
                setContent(data.content);
                if (data.imageUrl) {
                    setExistingImageUrl(data.imageUrl);
                }
            } catch (error) {
                toast.error("게시글을 불러오지 못했습니다.");
                navigate("/notice");
            } finally {
                setLoading(false);
            }
        };
        fetchNotice();
    }, [id, navigate]);

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const isMobile = windowWidth < 768;

    const mdeOptions = useMemo(() => ({
        spellChecker: false,
        status: false,
        minHeight: isMobile ? "200px" : "350px",
    }), [isMobile]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!id || !user) return;

        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("content", content);
            formData.append("deleteImage", String(isImageDeletedFlag));

            if (selectedFile) {
                formData.append("file", selectedFile);
            }

            await apiEditNotice(Number(id), formData);
            toast.success("공지사항이 수정되었습니다.");
            navigate(`/notice/${id}`);
        } catch (error) {
            toast.error("수정에 실패했습니다.");
        }
    };

    const handleEmojiSelect = (emoji: EmojiData) => {
        const maxLength = 1000;
        if (content.length + emoji.native.length <= maxLength) {
            setContent((prev) => prev + emoji.native);
        }
        setShowEmojiPicker(false);
    };


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 1 * 1024 * 1024) {
            toast.error("파일 크기는 1MB를 초과할 수 없습니다.");
            if (fileInput.current) fileInput.current.value = "";
            return;
        }

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        setIsImageDeletedFlag(true);
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const removeFile = () => {
        setSelectedFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        if (fileInput.current) fileInput.current.value = "";
    };



    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="w-full md:w-11/12 max-w-4xl justify-center mx-auto md:my-10">
            <div className="heading text-center font-bold text-3xl md:text-5xl m-5 text-slate-800 dark:text-slate-100">
                공지사항 수정
            </div>

            <form onSubmit={handleSubmit} className="editor mx-auto w-full flex flex-col p-4 md:shadow-lg md:rounded-lg bg-white dark:bg-slate-900 border dark:border-slate-700">
                <input
                    className="title bg-gray-50 dark:bg-slate-800 border p-3 mb-4 rounded-md focus:ring-2 focus:ring-primary/50 outline-none dark:text-white"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />

                <SimpleMDE value={content} onChange={setContent} options={mdeOptions} />

                <div className="text-sm text-gray-600 dark:text-white">
                    새 이미지 선택 시 기존 이미지는 자동으로 삭제됩니다
                </div>
                <div className="icons flex flex-col md:flex-row md:items-center m-2 gap-3 relative mt-4">
                    <div className="flex items-center gap-4 border-b md:border-none pb-2 md:pb-0">
                        <div className="relative">
                            <Smile
                                className={`cursor-pointer transition-colors ${showEmojiPicker ? 'text-primary' : 'hover:text-primary'}`}
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            />
                            {showEmojiPicker && (
                                <div className="absolute bottom-10 left-0 z-50 shadow-xl scale-90 origin-bottom-left md:scale-100">
                                    <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="auto" locale="ko" />
                                </div>
                            )}
                        </div>

                        <input type="file" ref={fileInput} onChange={handleFileChange} className="hidden" id="fileInput" accept="image/*" />
                        <label htmlFor="fileInput" className="cursor-pointer group flex items-center gap-2">
                            <Paperclip className="group-hover:text-primary transition-colors" size={20} />
                            <span className="text-[10px] md:text-xs text-muted-foreground leading-tight">
                                이미지 교체/추가
                            </span>
                        </label>
                    </div>

                    {(previewUrl || (existingImageUrl && !isImageDeletedFlag)) && (
                        <div className="flex gap-2 items-center py-1">
                            {existingImageUrl && !isImageDeletedFlag && !previewUrl && (
                                <div className="relative w-14 h-14 md:w-20 md:h-20 border rounded-md overflow-hidden group">
                                    <img src={existingImageUrl} className="w-full h-full object-cover opacity-80" />
                                    <button type="button" onClick={() => setIsImageDeletedFlag(true)} className="absolute top-0 right-0 bg-destructive text-white p-1 rounded-bl-md">
                                        <X size={10} />
                                    </button>
                                </div>
                            )}

                            {previewUrl && (
                                <div className="relative w-14 h-14 md:w-20 md:h-20 border-2 border-primary rounded-md overflow-hidden animate-in zoom-in-95 duration-200">
                                    <img src={previewUrl} className="w-full h-full object-cover" />
                                    <button type="button" onClick={removeFile} className="absolute top-0 right-0 bg-destructive text-white p-1 rounded-bl-md">
                                        <X size={10} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-between md:block md:ml-auto items-center">
                        {/* 모바일에서는 '이미지 없음' 텍스트를 작게 한 줄로 처리 */}
                        {!previewUrl && (isImageDeletedFlag || !existingImageUrl) && (
                            <span className="text-[10px] text-slate-400 md:hidden">첨부 이미지 없음</span>
                        )}
                        <div className="text-gray-400 text-[11px] md:text-xs font-medium">
                            <span className={content.length >= 1000 ? "text-red-500" : ""}>{content.length}</span> / 1000자
                        </div>
                    </div>
                </div>

                <div className="buttons flex gap-3 mt-6 pt-4 border-t dark:border-slate-700">
                    <Button type="button" variant="ghost" className="ml-auto" onClick={() => navigate(-1)}>취소</Button>
                    <Button type="submit" className="font-bold md:px-6">수정</Button>
                </div>
            </form>
        </div>
    );
};

export default NoticeEditPage;