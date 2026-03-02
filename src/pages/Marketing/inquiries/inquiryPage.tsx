import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Clock, Loader2, Search, ChevronRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext,
} from "@/components/ui/pagination";
import { useAuthStore } from "@/store/useAuthStore";
import { formatDate } from "@/lib/utils";
import { apiGetAllInquiries, apiGetMyInquiries } from "@/api/inquiryApi";

const InquiryPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [inquiries, setInquiries] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);

    const { user, isLoggedIn } = useAuthStore();
    const isAdmin = user?.role === "ROLE_ADMIN";

    const noticesPerPage = 10;
    const currentPage = Number(searchParams.get("page")) || 1;

    useEffect(() => {
        if (!isLoggedIn) {
            setLoading(false);
            return;
        }

        const fetchInquiries = async () => {
            try {
                setLoading(true);
                const safePage = Math.max(0, currentPage - 1);
                const response = isAdmin
                    ? await apiGetAllInquiries(safePage)
                    : await apiGetMyInquiries(safePage);

                setInquiries(response.content || []);
                if (response.page) {
                    setTotalPages(response.page.totalPages || 0);
                    setTotalElements(response.page.totalElements || 0);
                } else {
                    setTotalPages(response.totalPages || 0);
                    setTotalElements(response.totalElements || 0);
                }
            } catch (error) {
                console.error("데이터 로드 실패", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInquiries();
    }, [currentPage, isLoggedIn, isAdmin]);

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        navigate(`?page=${page}`);
    };

    const handleInquiryButton = () => {
        navigate("/inquiry/write");
    };

    return (
        <div className="min-h-screen flex flex-col pt-10 px-4 md:px-6">
            <header className="space-y-4 text-center mb-10">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                    {isAdmin ? "문의 관리" : "내 문의 내역"}
                </h1>
                <p className="text-muted-foreground">
                    {isAdmin ? "사용자들의 목소리에 귀를 기울여 주세요" : "궁금하신 점에 대해 정성껏 답변해 드립니다"}
                </p>
            </header>

            <div className="w-full rounded-lg border p-4 min-h-100 relative flex flex-col bg-card">
                {!isLoggedIn ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 gap-6">
                        <Clock className="w-8 h-8 text-slate-400" />
                        <p className="text-slate-500 text-lg font-medium">로그인이 필요한 페이지입니다.</p>
                        <Button onClick={() => navigate("/login")}>로그인하러 가기</Button>
                    </div>
                ) : loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                        <p className="text-sm text-muted-foreground">데이터 로딩중...</p>
                    </div>
                ) : inquiries.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
                        <Search className="w-8 h-8 text-slate-300" />
                        <p className="text-slate-500 text-lg font-medium">작성된 문의가 없어요</p>
                    </div>
                ) : (
                    <div className="flex-1">
                        <Table className="table-fixed w-full">
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-12 md:w-20 text-center font-bold">번호</TableHead>
                                    <TableHead className="font-bold text-left">문의 제목</TableHead>
                                    {isAdmin && <TableHead className="hidden sm:table-cell text-right w-24 font-bold">작성자</TableHead>}
                                    <TableHead className="hidden md:table-cell text-right w-28 font-bold">상태</TableHead>
                                    <TableHead className="text-right w-24 md:w-40 font-bold">날짜</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {inquiries.map((inquiry: any, index: number) => (
                                    <TableRow key={inquiry.id} className="group">
                                        <TableCell className="text-center text-xs md:text-sm px-1 text-muted-foreground tabular-nums">
                                            {Number(totalElements) - ((currentPage - 1) * noticesPerPage) - index}
                                        </TableCell>
                                        <TableCell className="truncate py-4">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <Link to={`/inquiry/${inquiry.id}`} className="hover:underline font-medium block truncate text-sm md:text-base">
                                                    {inquiry.title}
                                                </Link>
                                                <ChevronRight className="w-3 h-3 shrink-0 text-muted-foreground/50 group-hover:translate-x-1 transition-transform md:hidden" />
                                            </div>
                                            {/* 모바일 전용 상태 표시 (NoticeList의 author 하단 배치 스타일 참고) */}
                                            <div className="md:hidden mt-1 flex items-center gap-2">
                                                <span className={`text-[10px] font-bold ${inquiry.status === "ANSWERED" ? 'text-blue-500' : 'text-slate-400'}`}>
                                                    {inquiry.status === "ANSWERED" ? '답변완료' : '답변대기'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        {isAdmin && (
                                            <TableCell className="hidden sm:table-cell text-right text-xs md:text-sm text-muted-foreground truncate">
                                                {inquiry.userName}
                                            </TableCell>
                                        )}
                                        <TableCell className="hidden md:table-cell text-right">
                                            <span className={`inline-flex items-center text-xs font-bold ${inquiry.status === "ANSWERED" ? 'text-blue-500' : 'text-slate-400'}`}>
                                                {inquiry.status === "ANSWERED" ? (
                                                    <><CheckCircle2 size={12} className="mr-1" /> 답변완료</>
                                                ) : (
                                                    <><Clock size={12} className="mr-1" /> 답변대기</>
                                                )}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground tabular-nums">
                                            <span className="md:hidden text-[11px] whitespace-nowrap">{inquiry.createdAt.split('T')[0]}</span>
                                            <span className="hidden md:inline text-sm">{formatDate(inquiry.createdAt)}</span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <div className="mt-auto pt-8 flex justify-center">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href="#"
                                            onClick={(e) => { e.preventDefault(); if (currentPage > 1) handlePageChange(currentPage - 1); }}
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
                                            onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) handlePageChange(currentPage + 1); }}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    </div>
                )}
            </div>

            {!isAdmin && isLoggedIn && (
                <div className="flex justify-end mt-4 w-full">
                    <Button size="lg" className="px-8 shadow-md cursor-pointer" onClick={handleInquiryButton}>
                        문의하기
                    </Button>
                </div>
            )}
        </div>
    );
};

export default InquiryPage;