import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom"; // React Router로 변경
import { Button } from "@/components/ui/button";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext,
} from "@/components/ui/pagination";
import { Clock, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { apiNotices } from "@/api/noticeApi";
import { formatDate, isToday } from "@/lib/utils";

// 공지사항 타입 정의
interface Notice {
    id: number;
    title: string;
    author: string;
    views: number;
    createdAt: string;
}

const NoticeList = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [notices, setNotices] = useState<Notice[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);

    const { user, isLoggedIn } = useAuthStore();
    const canWrite = isLoggedIn && user?.role === "ROLE_ADMIN";

    const noticesPerPage = 10;
    const currentPage = Number(searchParams.get("page")) || 1;

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                setLoading(true);
                const response = await apiNotices(currentPage - 1, noticesPerPage);

                setNotices(response.content);
                if (response.page) {
                    setTotalPages(response.page.totalPages);
                    setTotalElements(response.page.totalElements);
                }
            } catch (error) {
                console.error("로딩 실패", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNotices();
    }, [currentPage]);


    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        navigate(`?page=${page}`);
    };


    return (
        <div className="min-h-screen flex flex-col pt-10 px-4 md:px-6">
            <header className="space-y-4 text-center mb-10">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">공지사항</h1>
                <p className="text-muted-foreground">새로운 소식과 업데이트를 확인하세요</p>
            </header>

            <div className="w-full rounded-lg border p-4 min-h-100 relative">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                        <p>데이터 로딩중...</p>
                    </div>
                ) : notices.length === 0 ? (
                    <div className="py-32 text-center flex flex-col items-center gap-4 box-content">
                        <Clock className="w-8 h-8 text-slate-400" />
                        <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">작성된 공지사항이 없어요</p>
                    </div>
                ) : (
                    <>
                        <Table className="table-fixed w-full">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-11.25 md:w-17.5 text-center font-bold">번호</TableHead>
                                    <TableHead className="font-bold text-left">제목</TableHead>
                                    <TableHead className="hidden sm:table-cell text-right w-20 md:w-25 font-bold">작성자</TableHead>
                                    <TableHead className="hidden md:table-cell text-right w-20 font-bold">조회수</TableHead>
                                    <TableHead className="hidden md:table-cell text-right w-21.25 md:w-45 font-bold">날짜</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {notices.map((notice, index) => (
                                    <TableRow key={notice.id}>
                                        <TableCell className="text-center text-xs md:text-sm px-1">
                                            {totalElements - ((currentPage - 1) * noticesPerPage) - index}
                                        </TableCell>
                                        <TableCell className="truncate">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <Link to={`/notice/${notice.id}`} className="hover:underline font-medium block truncate">
                                                    {notice.title}
                                                </Link>
                                                {isToday(notice.createdAt) && (
                                                    <span className="bg-secondary text-[10px] font-bold px-1.5 py-0.5 rounded-sm shrink-0 text-secondary-foreground">
                                                        NEW
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell text-right text-xs md:text-sm">
                                            {notice.author}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-right text-muted-foreground tabular-nums">
                                            {notice.views ?? 0}
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground tabular-nums">
                                            <span className="hidden md:inline text-sm">{formatDate(notice.createdAt)}</span>
                                            <div className="flex flex-col items-end md:hidden">
                                                <span className="text-[10px] text-slate-400 leading-none">
                                                    {!notice.author ? "" : `${notice.author} | `}조회 {notice.views ?? 0}
                                                </span>
                                                <span className="text-[11px] whitespace-nowrap">{formatDate(notice.createdAt)}</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <div className="mt-8 flex justify-center">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (currentPage > 1) handlePageChange(currentPage - 1);
                                            }}
                                        />
                                    </PaginationItem>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter(page => page >= currentPage - 2 && page <= currentPage + 2)
                                        .map((page) => (
                                            <PaginationItem key={page}>
                                                <PaginationLink
                                                    href="#"
                                                    isActive={currentPage === page}
                                                    onClick={(e) => { e.preventDefault(); handlePageChange(page); }}
                                                >
                                                    {page}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}

                                    <PaginationItem>
                                        <PaginationNext
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (currentPage < totalPages) handlePageChange(currentPage + 1);
                                            }}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    </>
                )}
            </div>
            {canWrite && (
                <div className="flex justify-end mt-4 w-full">
                    <Button size="lg" className="px-8 shadow-md cursor-pointer" onClick={() => navigate("/notice/write")}>글쓰기</Button>
                </div>
            )}
        </div>
    );
};

export default NoticeList;