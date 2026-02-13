import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    apiRestoreDocument,
    apiHardDeleteDocument
} from "@/api/documentApi";
import { useTrashStore } from "@/store/useTrashStore";
import { ConfirmModal } from "@/components/Main/Modal/ConfirmModal";

interface BannerProps {
    documentId: number;
    onUpdate?: () => void;
}

export function Banner({ documentId, onUpdate }: BannerProps) {
    const navigate = useNavigate();
    const { workspaceCode } = useParams<{ workspaceCode: string }>();
    const { notifyTrashUpdate } = useTrashStore();

    // 문서 복구
    const onRestore = async () => {
        const promise = apiRestoreDocument(documentId)
            .then((updatedDoc) => {
                notifyTrashUpdate();

                if (onUpdate) {
                    onUpdate();
                }

                return updatedDoc;
            });

        toast.promise(promise, {
            loading: "노트를 복구하는 중...",
            success: "노트가 복구되었습니다!",
            error: "노트 복구에 실패했습니다.",
        });
    };

    // 영구 삭제
    const onRemove = async () => {
        const promise = apiHardDeleteDocument(documentId).then(() => {
            notifyTrashUpdate();
            navigate(`/workspace/${workspaceCode}`);
        });

        toast.promise(promise, {
            loading: "노트를 영구 삭제 중...",
            success: "노트가 완전히 삭제되었습니다!",
            error: "노트 삭제에 실패했습니다.",
        });
    };

    return (
        <div className="w-full bg-rose-500 text-center text-sm p-2 text-white flex gap-x-2 justify-center items-center">
            <p>이 페이지는 휴지통에 있습니다.</p>

            <Button
                variant="outline"
                size="sm"
                onClick={onRestore}
                className="border-white bg-transparent hover:bg-white/20 text-white hover:text-white p-1 px-2 h-auto font-normal pointer-events-auto cursor-pointer"
            >
                페이지 복원
            </Button>

            <ConfirmModal
                onConfirm={onRemove}
                documentId={documentId}
                workspaceCode={workspaceCode}
            >
                <Button
                    variant="outline"
                    size="sm"
                    className="border-white bg-transparent hover:bg-white/20 text-white hover:text-white p-1 px-2 h-auto font-normal pointer-events-auto cursor-pointer"
                >
                    영구 삭제
                </Button>
            </ConfirmModal>
        </div>
    );
}