import axiosAuthInstance from "./axiosAuthInstance";

export interface DocumentResponse {
    id: number;
    title: string;
    content?: string;
    icon?: string;
    coverImage?: string;
    parentId?: number;
    hasChildren: boolean;
    archived: boolean;
    published: boolean;
    lastEditedBy: string;
    createdAt: string;
}

export interface DocumentCreateRequest {
    title: string;
    workspaceCode: string;
    parentId?: number;
    icon?: string;
    coverImage?: string;
    content?: string;
}

// 사이드바 문서 목록
export const apiGetSidebarDocuments = async (
    workspaceCode: string,
    parentId?: number
): Promise<DocumentResponse[]> => {
    const response = await axiosAuthInstance.get('/documents/sidebar', {
        params: { workspaceCode, parentId }
    });
    return response.data;
};

// 문서 생성
export const apiCreateDocument = async (
    request: DocumentCreateRequest
): Promise<DocumentResponse> => {
    const response = await axiosAuthInstance.post('/documents', request);
    return response.data;
};

// 문서 상세 조회
export const apiGetDocumentById = async (
    documentId: number,
    workspaceCode: string
): Promise<DocumentResponse> => {
    const response = await axiosAuthInstance.get(`/documents/${documentId}`, {
        params: { workspaceCode }
    });
    return response.data;
};

// 문서 아카이브(휴지통 이동)
export const apiArchiveDocument = async (
    documentId: number
): Promise<void> => {
    await axiosAuthInstance.put(`/documents/${documentId}/archive`);
};

// 휴지통 목록 조회
export const apiGetTrashDocuments = async (
    workspaceCode: string
): Promise<DocumentResponse[]> => {
    const response = await axiosAuthInstance.get(`/documents/trash`, {
        params: { workspaceCode }
    });
    return response.data;
};

// 문서 휴지통에서 복구
export const apiRestoreDocument = async (
    documentId: number
): Promise<DocumentResponse> => {
    const response = await axiosAuthInstance.put(`/documents/${documentId}/restore`);
    return response.data;
};

// 문서 영구 삭제
export const apiHardDeleteDocument = async (
    documentId: number
): Promise<void> => {
    await axiosAuthInstance.delete(`/documents/${documentId}`);
};

// 제목 커버 이미지 등 수정
export const apiUpdateDocument = async (
    documentId: number,
    request: Partial<DocumentCreateRequest>
): Promise<DocumentResponse> => {
    const response = await axiosAuthInstance.patch(`/documents/${documentId}`, request);
    return response.data;
};

// 문서 내용 수정
export const apiUpdateDocumentContent = async (
    documentId: number,
    content: string
): Promise<void> => {
    await axiosAuthInstance.patch(`/documents/${documentId}/content`, content, {
        headers: { 'Content-Type': 'text/plain' }
    });
};

/**
 * Redis 스냅샷 수동 저장
 */
export const apiUpdateDocumentRedisSnapshot = async (
    documentId: number,
    content: string
): Promise<void> => {
    await axiosAuthInstance.post(`/documents/${documentId}/snapshots`, content, {
        headers: { 'Content-Type': 'text/plain' }
    });
};


// Redis 스냅샷 조회 (상세 조회 시 통합되어 제공되나 별도 필요 시 사용)
export const apiGetDocumentRedisSnapshot = async (documentId: number): Promise<string> => {
    const response = await axiosAuthInstance.get(`/documents/${documentId}/snapshots`);
    return response.data;
};