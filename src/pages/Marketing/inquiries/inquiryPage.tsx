import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Clock, ChevronRight, Loader2, Plus, Search } from "lucide-react"; // Plus 아이콘 추가
import { Button } from "@/components/ui/button";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext,
} from "@/components/ui/pagination";
import { useAuthStore } from "@/store/useAuthStore";
import { formatDate } from "@/lib/utils";
import { apiInquiries } from "@/api/inquiryApi";

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
                const response = await apiInquiries(currentPage);
                setInquiries(response.data.content);
                setTotalPages(response.data.totalPages);
                setTotalElements(response.data.totalElements);
            } catch (error) {
                console.error("데이터 로드 실패", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInquiries();
    }, [currentPage, isLoggedIn]);

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        navigate(`?page=${page}`);
    };

    const handleInquiryButton = () => {
        if (!isLoggedIn) {
            alert("문의를 작성하기 위해선 로그인을 해야합니다.");
            return;
        }
        navigate("/inquiry/write");
    };

    return (
        <div className="min-h-screen dark:bg-transparent flex flex-col pt-16 px-4 md:px-8 pb-20">
            <div className="max-w-8xl mx-auto w-full">
                <header className="flex flex-col md:flex-row md:items-center gap-6 mb-12 justify-center text-center">
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                            {isAdmin ? "문의 관리" : "내 문의 내역"}
                        </h1>
                        <div className="text-slate-500 text-lg max-w-md">
                            {isAdmin ? "사용자들의 목소리에 귀를 기울여 주세요" : "궁금하신 점에 대해 정성껏 답변해 드립니다"}
                        </div>
                    </div>
                </header>

                <div className="w-full rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden relative">
                    {!isLoggedIn ? (
                        <div className="py-40 text-center flex flex-col items-center gap-6">
                            <div className="p-4 bg-slate-100 rounded-full"><Clock className="w-10 h-10 text-slate-400" /></div>
                            <p className="text-slate-500 text-xl font-semibold">로그인이 필요한 페이지입니다.</p>
                            <Button onClick={() => navigate("/login")} variant="default" size="lg">로그인 페이지로 이동</Button>
                        </div>
                    ) : loading ? (
                        <div className="flex flex-col items-center justify-center py-40 gap-4">
                            <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                            <p className="font-medium text-slate-400 animate-pulse">문의 내역을 가져오는 중...</p>
                        </div>
                    ) : inquiries.length === 0 ? (
                        <div className="py-40 text-center flex flex-col items-center gap-4">
                            <div className="p-4 bg-slate-50 rounded-full"><Search className="w-10 h-10 text-slate-300" /></div>
                            <p className="text-slate-400 text-lg">아직 작성된 문의가 없습니다.</p>
                        </div>
                    ) : (
                        <>
                            <Table className="table-fixed w-full">
                                <TableHeader className="bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm">
                                    <TableRow className="hover:bg-transparent border-b border-slate-200 dark:border-slate-800">
                                        <TableHead className="w-16 md:w-24 text-center font-bold text-slate-900 dark:text-slate-100">번호</TableHead>
                                        <TableHead className="font-bold text-slate-900 dark:text-slate-100">문의 제목</TableHead>
                                        {isAdmin && <TableHead className="hidden sm:table-cell text-center w-32 font-bold">작성자</TableHead>}
                                        <TableHead className="hidden md:table-cell text-center w-32 font-bold">상태</TableHead>
                                        <TableHead className="w-28 md:w-44 text-right font-bold pr-8">등록일</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {inquiries.map((inquiry: any, index: number) => (
                                        <TableRow key={inquiry.id} className="group border-b border-slate-100 dark:border-slate-800 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                                            <TableCell className="text-center text-slate-400 tabular-nums font-medium">
                                                {totalElements - ((currentPage - 1) * noticesPerPage) - index}
                                            </TableCell>
                                            <TableCell className="py-5">
                                                <div className="flex flex-col gap-1.5 overflow-hidden">
                                                    <Link to={`/inquiry/${inquiry.id}`} className="font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2 truncate">
                                                        {inquiry.title}
                                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                                                    </Link>
                                                    {/* 모바일 배지 레이아웃 */}
                                                    <div className="md:hidden flex items-center gap-2">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${inquiry.status === "COMPLETED" ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                                                            {inquiry.status === "COMPLETED" ? 'Completed' : 'Pending'}
                                                        </span>
                                                        {isAdmin && <span className="text-[10px] text-slate-400">by {inquiry.userName}</span>}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            {isAdmin && (
                                                <TableCell className="hidden sm:table-cell text-center text-sm font-medium text-slate-600">
                                                    {inquiry.userName}
                                                </TableCell>
                                            )}
                                            <TableCell className="hidden md:table-cell text-center">
                                                {inquiry.status === "COMPLETED" ? (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-100 dark:border-blue-800">
                                                        <CheckCircle2 size={12} className="mr-1.5" /> 답변완료
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 text-xs font-bold border border-slate-100 dark:border-slate-800">
                                                        <Clock size={12} className="mr-1.5" /> 답변대기
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right text-slate-400 tabular-nums pr-8 font-medium">
                                                {formatDate(inquiry.createdAt)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* 3. 하단 푸터 영역 (페이지네이션) */}
                            <footer className="py-8 bg-slate-50/30 dark:bg-slate-800/30 flex justify-center border-t border-slate-100 dark:border-slate-800">
                                <Pagination>
                                    <PaginationContent className="gap-2">
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href="#"
                                                onClick={(e) => { e.preventDefault(); if (currentPage > 1) handlePageChange(currentPage - 1); }}
                                                className="hover:bg-white dark:hover:bg-slate-900 border-none shadow-sm"
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
                                                        className={currentPage === page ? "shadow-md shadow-blue-100" : "hover:bg-white border-none"}
                                                    >
                                                        {page}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            ))}
                                        <PaginationItem>
                                            <PaginationNext
                                                href="#"
                                                onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) handlePageChange(currentPage + 1); }}
                                                className="hover:bg-white dark:hover:bg-slate-900 border-none shadow-sm"
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </footer>
                        </>
                    )}
                </div>
                {!isAdmin && isLoggedIn && (
                    <div className="mt-4 text-right">
                        <Button onClick={handleInquiryButton} size="lg" className="rounded-lg px-8 shadow-lg shadow-gray-400 dark:shadow-none hover:scale-105 transition-all gap-2">
                            <Plus size={20} />
                            문의하기
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InquiryPage;