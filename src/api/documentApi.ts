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

/**
 * 사이드바 문서 목록 조회 (계층형)
 * @param workspaceCode URL의 inviteCode
 * @param parentId 부모 문서 ID (최상위 조회 시 null/undefined)
 */
export const apiGetSidebarDocuments = async (
    workspaceCode: string,
    parentId?: number
): Promise<DocumentResponse[]> => {
    const response = await axiosAuthInstance.get('/documents/sidebar', {
        params: { workspaceCode, parentId }
    });
    return response.data;
};


export const apiCreateDocument = async (
    request: DocumentCreateRequest
): Promise<DocumentResponse> => {
    const response = await axiosAuthInstance.post('/documents', request);
    return response.data;
};

export const apiGetDocumentById = async (
    documentId: number,
    workspaceCode: string
): Promise<DocumentResponse> => {
    // URL 파라미터나 쿼리 스트링으로 workspaceCode 함께 전달
    const response = await axiosAuthInstance.get(`/documents/${documentId}`, {
        params: { workspaceCode }
    });
    return response.data;
};

export const apiArchiveDocument = async (
    documentId: number
): Promise<void> => {
    await axiosAuthInstance.patch(`/documents/${documentId}/archive`);
};


/**
 * 휴지통 목록 조회
 * @param workspaceCode 워크스페이스 초대 코드
 */
export const apiGetTrashDocuments = async (
    workspaceCode: string
): Promise<DocumentResponse[]> => {
    const response = await axiosAuthInstance.get(`/documents/trash`, {
        params: { workspaceCode }
    });
    return response.data;
};

/**
 * 문서 복구 (isArchived를 false로 변경)
 * @param documentId 복구할 문서 ID
 */
export const apiRestoreDocument = async (
    documentId: number
): Promise<DocumentResponse> => {
    const response = await axiosAuthInstance.patch(`/documents/${documentId}/restore`);
    return response.data;
};

/**
 * 문서 영구 삭제 (DB에서 제거)
 * @param documentId 삭제할 문서 ID
 */
export const apiHardDeleteDocument = async (
    documentId: number
): Promise<void> => {
    await axiosAuthInstance.delete(`/documents/${documentId}`);
};

export const apiUpdateDocument = async (
    documentId: number,
    request: Partial<DocumentCreateRequest>
): Promise<DocumentResponse> => {
    const response = await axiosAuthInstance.patch(`/documents/${documentId}`, request);
    return response.data;
};