import { useParams, useNavigate } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { apiCreateDocument } from "@/api/documentApi";
import { useTrashStore } from "@/store/useTrashStore";
import { useDocumentStore } from "@/store/useDocumentStore";

function DocumentsWelcomePage() {
    const navigate = useNavigate();
    const params = useParams<{ workspaceCode: string }>();
    const workspaceCode = params.workspaceCode;

    const user = useAuthStore((state) => state.user);

    const { notifyTrashUpdate } = useTrashStore();

    const addDocumentToStore = useDocumentStore((state) => state.addDocument);
    // 워크스페이스 코드가 없으면 아무것도 렌더링하지 않음 (보통 가드에서 걸러지겠지만 안전용)
    if (!workspaceCode) {
        return null;
    }

    const onCreate = async () => {
        try {
            const promise = apiCreateDocument({
                title: "제목 없음",
                workspaceCode: workspaceCode,
            });

            toast.promise(promise, {
                loading: "새 노트를 생성하는 중...",
                success: "새 노트가 생성되었습니다!",
                error: "노트 생성에 실패했습니다.",
            });

            const newDoc = await promise;

            addDocumentToStore(newDoc);

            notifyTrashUpdate();

            // 생성 성공 후 해당 문서의 에디터 페이지로 이동
            navigate(`/workspace/${workspaceCode}/documents/${newDoc.id}`);
        } catch (err) {
            console.error("문서 생성 중 오류 발생:", err);
        }
    };

    return (
        <div className="h-full flex flex-col items-center justify-center space-y-4 bg-background dark:bg-[#1F1F1F]">
            <img
                src="/empty.png"
                height="300"
                width="300"
                alt="empty"
                className="dark:hidden block"
            />
            <img
                src="/empty-dark.png"
                height="300"
                width="300"
                alt="empty"
                className="dark:block hidden"
            />

            <h2 className="text-lg font-medium">
                {user?.nickname || "사용자"}님의 Coope에 온 걸 환영합니다!
            </h2>

            <Button onClick={onCreate} className="shadow-sm">
                <PlusCircle className="w-4 h-4 mr-2" />
                새 노트 생성
            </Button>
        </div>
    );
}

export default DocumentsWelcomePage;