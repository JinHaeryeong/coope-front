import type { DocumentResponse } from '@/api/documentApi';
import { create } from 'zustand';


interface DocumentStore {
    documents: DocumentResponse[];
    setDocuments: (documents: DocumentResponse[]) => void;
    updateDocumentTitle: (id: number, title: string) => void;
    addDocument: (newDoc: DocumentResponse) => void;
    upsertDocument: (newDoc: DocumentResponse) => void;
    removeDocument: (docId: number) => void;
}

export const useDocumentStore = create<DocumentStore>((set) => ({
    documents: [],
    setDocuments: (documents) => set({ documents }),
    updateDocumentTitle: (id, title) => set((state) => ({
        documents: state.documents.map((doc) =>
            doc.id === id ? { ...doc, title } : doc
        )
    })),
    addDocument: (newDoc) => set((state) => {
        const exists = state.documents.find((d) => d.id === newDoc.id);
        if (exists) return state;

        const nextDocs = [...state.documents, newDoc];
        nextDocs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return { documents: nextDocs };
    }),
    upsertDocument: (newDoc: DocumentResponse) => set((state) => {
        const exists = state.documents.find((d) => d.id === newDoc.id);
        let nextDocs;

        if (exists) {
            nextDocs = state.documents.map((d) =>
                d.id === newDoc.id ? { ...d, ...newDoc } : d
            );
        } else {
            nextDocs = [...state.documents, newDoc];
        }

        nextDocs.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
        });

        return { documents: nextDocs };
    }),

    removeDocument: (docId: number) => set((state) => ({
        documents: state.documents.filter((d) => d.id !== docId)
    })),
}));