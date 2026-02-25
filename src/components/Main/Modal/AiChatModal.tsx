import { useState, useRef, useEffect, useCallback, useMemo, type ComponentProps } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Square } from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";
import { useChatStore, type Message } from "@/store/useChatStore";
import type { SyntaxHighlighterProps } from "react-syntax-highlighter";
import { apiStreamChat } from "@/api/aiChatApi";
import { useAiUsageStore } from "@/store/useAiUsageStore";
import { toast } from "sonner";

const style = vscDarkPlus as SyntaxHighlighterProps["style"];


export const AIChatModal = ({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) => {
    const { messages, addMessage } = useChatStore();

    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [currentResponse, setCurrentResponse] = useState("");

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const { chatRemaining, setUsage } = useAiUsageStore();

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        if (isOpen) {
            const timer = window.setTimeout(scrollToBottom, 100);
            return () => window.clearTimeout(timer);
        }
    }, [isOpen, scrollToBottom]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, currentResponse, scrollToBottom]);

    const processStream = useCallback(async (reader: ReadableStreamDefaultReader<Uint8Array>) => {
        const decoder = new TextDecoder();
        let accumulated = "";
        let buffer = "";

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                // 새로 들어온 청크를 기존 버퍼 뒤에 붙임
                buffer += decoder.decode(value, { stream: true });

                // 버퍼 안에 줄바꿈(\n)이 있는 동안 계속 처리
                let lineBreakIndex;
                while ((lineBreakIndex = buffer.indexOf('\n')) !== -1) {
                    const line = buffer.slice(0, lineBreakIndex).trim(); // 한 줄 추출
                    buffer = buffer.slice(lineBreakIndex + 1); // 처리한 줄은 버퍼에서 제거

                    if (line.startsWith('data:')) {
                        const content = line.replace(/^data:/, '');
                        accumulated += content;
                        setCurrentResponse(accumulated); // 여기서 상태 업데이트가 일어나며 스르륵 보임
                    }
                }
            }

            // 마지막에 남은 버퍼가 있다면 마저 처리 (보통 [DONE] 신호 전의 마지막 텍스트)
            if (buffer.trim().startsWith('data:')) {
                accumulated += buffer.replace(/^data:/, '');
                setCurrentResponse(accumulated);
            }

            addMessage({ role: "assistant", content: accumulated });
        } catch (error: unknown) {
            if (!(error instanceof Error && error.name === 'AbortError')) {
                console.error("Stream error:", error);
            }
        }
    }, [addMessage]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input;
        addMessage({ role: "user", content: userMessage });
        setInput("");
        setIsLoading(true);
        setCurrentResponse("");

        abortControllerRef.current = new AbortController();

        try {
            const reader = await apiStreamChat(
                userMessage,
                messages,
                abortControllerRef.current!.signal
            );

            await processStream(reader);
            // toast.info("아직 연동중..")
        } catch (error: unknown) {
            if (!(error instanceof Error && error.name === 'AbortError')) {
                addMessage({
                    role: "assistant",
                    content: "오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
                });
            }
        } finally {
            setIsLoading(false);
            setCurrentResponse("");
            abortControllerRef.current = null;
        }
    };


    const handleStop = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            const nextCount = Math.max(0, chatRemaining - 1);
            setUsage("CHAT", nextCount);

            toast.info("답변 생성을 중단했습니다. (횟수 1회 소모)");
        }
    };

    // useMemo를 사용하여 마크다운 렌더링 로직 최적화
    const markdownComponents = useMemo(() => ({
        code({ className, children, ...props }: ComponentProps<"code">) {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match;

            return !isInline ? (
                <SyntaxHighlighter
                    style={style}
                    language={match[1]}
                    PreTag="div"
                >
                    {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
            ) : (
                <code className={cn("bg-slate-200 px-1 rounded text-rose-600 font-mono", className)} {...props}>
                    {children}
                </code>
            );
        }
    }), []); // 컴포넌트 마운트 시에만 생성

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="h-[80vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-4 shadow-sm">
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        AI Assistant
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg: Message, idx: number) => (
                        <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div className={cn(
                                "max-w-[85%] rounded-xl p-3 text-sm shadow-sm leading-relaxed",
                                msg.role === "user" ? "dark:shadow-amber-50" : "max-w-[85%] rounded-2xl p-4 text-sm border shadow-sm"
                            )}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                    {msg.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="max-w-[85%] rounded-2xl p-4 text-sm border shadow-sm">
                                {currentResponse ? (
                                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                        {currentResponse}
                                    </ReactMarkdown>
                                ) : (
                                    <div className="flex gap-1 items-center h-5">
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSubmit} className="p-4 border-t flex flex-col gap-2">
                    <div className="flex justify-end pr-1">
                        <span className={cn(
                            "text-[10px] font-medium px-2 py-0.5 rounded-full",
                            chatRemaining > 1 ? "bg-slate-100 text-slate-500" : "bg-rose-100 text-rose-600 animate-pulse"
                        )}>
                            오늘 남은 질문: {chatRemaining}회
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading || chatRemaining <= 0}
                            placeholder={chatRemaining <= 0 ? "오늘 사용량을 모두 소모했습니다." : "메시지를 입력하세요..."}
                            className="flex-1 h-11"
                        />
                        {isLoading ? (
                            <Button type="button" onClick={handleStop} variant="outline" className="shrink-0 h-11 border-rose-200 text-rose-600 hover:bg-rose-50 px-4">
                                <Square className="h-4 w-4 fill-current" />
                            </Button>
                        ) : (
                            <Button type="submit" disabled={!input.trim() || chatRemaining <= 0} className="h-11 px-4">
                                <Send className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};