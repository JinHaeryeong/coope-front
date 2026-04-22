import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Eye, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { PostDetailResponse } from "../types/posts";
import { getCategoryStyle, getCategoryLabel } from "../utils/communityUtils";
import { formatDate } from "@/lib/utils";

interface PostDetailViewProps {
    post: PostDetailResponse;
}

export const PostDetailView = ({ post }: PostDetailViewProps) => {
    return (
        <div className="w-full max-w-8xl mx-auto">
            <div className="space-y-4 mb-8">
                <Badge className={getCategoryStyle(post.category)}>
                    {getCategoryLabel(post.category)}
                </Badge>
                <h1 className="text-2xl md:text-4xl font-bold leading-tight break-all">
                    {post.title}
                </h1>

                {/* TODO: 유저 닉네임을 보여주고, 친구 추가 기능을 닉네임 검색 => 이메일 검색으로 수정하기 */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-2">
                    <div className="flex items-center gap-1.5 font-medium">
                        <User size={16} /> 익명
                    </div>
                    <div className="flex items-center gap-1.5">
                        <CalendarDays size={16} /> {formatDate(post.createdAt)}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Eye size={16} /> {post.viewCount} 조회
                    </div>
                </div>
            </div>

            <Separator className="my-8" />

            {/* 모집 정보 카드 (RECRUITMENT일 때만) */}
            {post.category === "RECRUITMENT" && (
                <div className="mb-10 p-6 rounded-2xl bg-slate-50 border border-slate-200 dark:bg-gray-950 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">모집 정보</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <span className="text-xs text-slate-400">기술 스택</span>
                            <div className="flex flex-wrap gap-2">
                                {post.techStack?.split(',').map((tech, i) => (
                                    <Badge key={i} variant="secondary" className="bg-white dark:bg-slate-800 border">
                                        {tech.trim()}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <span className="text-xs text-slate-400">참여 인원 현황</span>
                            <div className="text-xl font-bold text-blue-600">
                                {post.currentMembers} / {post.targetMembers} <span className="text-sm text-slate-500 font-normal">명</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 본문 (마크다운 지원) */}
            <div className="prose dark:prose-invert prose-p:my-0.5 
        prose-headings:mt-4 
        prose-headings:mb-2 max-w-none mb-16 text-slate-700 dark:text-slate-200 leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {post.content}
                </ReactMarkdown>
            </div>
        </div>
    );
};