import { Skeleton } from "@/components/ui/skeleton";
import { type DocumentResponse } from "@/api/documentApi";
import { useDocumentStore } from "@/store/useDocumentStore";

interface TitleProps {
    initialData: DocumentResponse;
}

export function Title({ initialData }: TitleProps) {
    const title = useDocumentStore((state) =>
        state.documents.find(doc => doc.id === initialData.id)?.title || initialData.title
    );

    const icon = useDocumentStore((state) =>
        state.documents.find(doc => doc.id === initialData.id)?.icon || initialData.icon
    );

    return (
        <div className="flex items-center gap-x-2">
            {icon && <span className="text-sm shrink-0">{icon}</span>}

            <span className="truncate font-semibold text-sm max-w-30 md:max-w-50 text-neutral-700 dark:text-neutral-300">
                {title || "제목 없음"}
            </span>
        </div>
    );
}

Title.Skeleton = function TitleSkeleton() {
    return (
        <Skeleton className="w-20 h-5 rounded-md bg-neutral-200 dark:bg-neutral-800" />
    );
};