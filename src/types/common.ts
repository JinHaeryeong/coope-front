export interface PageResponse<T> {
    content: T[];          // 실제 데이터 리스트
    last: boolean;         // 마지막 페이지 여부
    totalPages: number;    // 전체 페이지 수
    totalElements: number; // 전체 데이터 개수
    size: number;          // 페이지 당 데이터 개수
    number: number;        // 현재 페이지 번호
}