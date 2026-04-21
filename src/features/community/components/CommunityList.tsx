import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare, Eye, PenBox } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { communityApi } from "../api/communityApi";
import type { PostResponse, PostCategory } from "../types/posts";
import { getCategoryStyle, getCategoryLabel } from "../utils/communityUtils";
import { formatDate } from "@/lib/utils";
import { CategoryTabs } from "./CategoryTabs";

const CommunityList = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { isLoggedIn } = useAuthStore();

    const [posts, setPosts] = useState<PostResponse[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);

    const currentPage = Number(searchParams.get("page")) || 1;
    const currentCategory = (searchParams.get("category") as PostCategory | "all") || "all";

    const postsPerPage = 15;

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                const response = await communityApi.getPosts(currentPage - 1, postsPerPage, currentCategory);

                setPosts(response.content);
                if (response.page) {
                    setTotalPages(response.page.totalPages);
                }
            } catch (error) {
                console.error("커뮤니티 로딩 실패", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [currentPage, currentCategory]);

    const handlePageChange = (page: number) => {
        navigate(`?category=${currentCategory}&page=${page}`);
    };

    const handleCategoryChange = (category: string) => {
        // 카테고리 변경 시 페이지는 항상 1페이지로 초기화
        navigate(`?category=${category}&page=1`);
    };

    return (
        <div className="flex flex-col gap-6">

            <header className="space-y-4 text-center mb-10">
                <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl">커뮤니티</h1>
                <p className="text-muted-foreground">다양한 사람들과 소통하고 팀원을 모집해보세요</p>
            </header>



            <CategoryTabs currentCategory={currentCategory} onCategoryChange={handleCategoryChange} />

            {/* 테이블 영역 */}
            <div className="rounded-md border bg-card relative min-h-100 flex flex-col">
                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">목록을 불러오는 중...</p>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                        <p>해당 카테고리에 게시글이 없습니다.</p>
                    </div>
                ) : (
                    <>
                        <Table className="table-fixed w-full">
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-25 text-center font-bold">카테고리</TableHead>
                                    <TableHead className="font-bold text-left">제목</TableHead>
                                    <TableHead className="w-30 text-right hidden sm:table-cell font-bold">정보/날짜</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {posts.map((post) => (
                                    <TableRow
                                        key={post.id}
                                        className="cursor-pointer"
                                        onClick={() => navigate(`/community/${post.id}`)}
                                    >
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className={getCategoryStyle(post.category)}>
                                                {getCategoryLabel(post.category)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="truncate">
                                            <div className="flex flex-col gap-1 overflow-hidden">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium truncate">{post.title}</span>
                                                    {post.commentCount > 0 && (
                                                        <span className="flex items-center gap-0.5 text-blue-600 text-xs font-bold shrink-0">
                                                            <MessageSquare className="w-3 h-3" />
                                                            {post.commentCount}
                                                        </span>
                                                    )}
                                                </div>
                                                {post.category === "RECRUITMENT" && (
                                                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground truncate">
                                                        <span className="bg-slate-100 dark:bg-gray-950 px-1 rounded shrink-0">{post.techStack}</span>
                                                        <span className="truncate">인원: {post.currentMembers}/{post.targetMembers}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground text-sm hidden sm:table-cell">
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="whitespace-nowrap">{formatDate(post.createdAt)}</span>
                                                <span className="text-[10px] flex items-center gap-1">
                                                    <Eye className="w-3 h-3" /> {post.viewCount}
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {/* 페이지네이션 */}
                        <div className="p-4 border-t mt-auto">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href="#"
                                            onClick={(e) => { e.preventDefault(); if (currentPage > 1) handlePageChange(currentPage - 1); }}
                                        />
                                    </PaginationItem>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter(p => p >= currentPage - 2 && p <= currentPage + 2)
                                        .map(p => (
                                            <PaginationItem key={p}>
                                                <PaginationLink
                                                    href="#"
                                                    isActive={currentPage === p}
                                                    onClick={(e) => { e.preventDefault(); handlePageChange(p); }}
                                                >
                                                    {p}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))
                                    }
                                    <PaginationItem>
                                        <PaginationNext
                                            href="#"
                                            onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) handlePageChange(currentPage + 1); }}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    </>
                )}
            </div>

            {/* TODO: 글쓰기 기능 추가 */}

            {isLoggedIn && (
                <div className="flex justify-end w-full">
                    <Button
                        size="lg"
                        className="px-8 shadow-md cursor-pointer gap-2"
                        onClick={() => navigate("/community/write")}
                    >
                        <PenBox className="w-4 h-4" />
                        글쓰기
                    </Button>
                </div>
            )}
        </div>
    );
};

export default CommunityList;