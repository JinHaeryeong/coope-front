import type { DocumentResponse } from '@/api/documentApi';
import { create } from 'zustand';


interface DocumentStore {
    documents: DocumentResponse[];
    setDocuments: (documents: DocumentResponse[]) => void;
    updateDocumentTitle: (id: number, title: string) => void;
    addDocument: (newDoc: DocumentResponse) => void;
    upsertDocument: (newDoc: DocumentResponse) => void;
    updateDocumentContentOnly: (id: number, content: string) => void;
    removeDocument: (docId: number) => void;
    clearDocuments: () => void;
}

export const useDocumentStore = create<DocumentStore>((set) => ({
    documents: [],

    setDocuments: (newDocs) => set((state) => {
        const merged = [...state.documents];

        newDocs.forEach(newDoc => {
            const index = merged.findIndex(d => d.id === newDoc.id);
            if (index !== -1) {
                merged[index] = { ...merged[index], ...newDoc };
            } else {
                merged.push(newDoc);
            }
        });

        merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return { documents: merged };
    }),

    updateDocumentTitle: (id, title) => set((state) => ({
        documents: state.documents.map((doc) =>
            doc.id === id ? { ...doc, title } : doc
        )
    })),

    addDocument: (newDoc) => set((state) => {
        const exists = state.documents.find((d) => d.id === newDoc.id);
        if (exists) return state;

        const nextDocs = [newDoc, ...state.documents];
        nextDocs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return { documents: nextDocs };
    }),

    upsertDocument: (newDoc) => set((state) => {
        const index = state.documents.findIndex((d) => d.id === newDoc.id);

        if (index !== -1) {
            const nextDocs = [...state.documents];
            nextDocs[index] = { ...nextDocs[index], ...newDoc };
            return { documents: nextDocs };
        }

        const nextDocs = [...state.documents, newDoc];
        nextDocs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return { documents: nextDocs };
    }),

    updateDocumentContentOnly: (id: number, content: string) => {
        set((state) => ({
            documents: state.documents.map((doc) =>
                doc.id === id ? { ...doc, content } : doc
            ),
        }));
    },

    removeDocument: (docId: number) => set((state) => ({
        documents: state.documents.filter((d) => d.id !== docId)
    })),
    clearDocuments: () => set({ documents: [] }),
}));