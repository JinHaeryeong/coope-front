import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // 💡 Next.js의 useRouter 대신 사용
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useSettings } from "@/hooks/useSettings";
import { Label } from '@/components/ui/label';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/Common/ModeToggle";
import { toast } from "sonner";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import type { WorkspaceModalProps } from "@/types/workspace";
import {
    apiUpdateWorkspace,
    apiDeleteWorkspace
} from "@/api/workspaceApi";

interface SettingsModalProps extends WorkspaceModalProps {
    initialName?: string;
}

export function SettingsModal({ workspaceCode, initialName }: SettingsModalProps) {
    const settings = useSettings();
    const navigate = useNavigate();

    const { workspaces, isLoading, updateWorkspaceName, deleteWorkspaceFromStore } = useWorkspaceStore();
    const isLastWorkspace = !isLoading && workspaces.length <= 1;

    const [name, setName] = useState(initialName ?? "");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (settings.isOpen && initialName !== undefined) {
            setName(initialName);
        }
    }, [settings.isOpen, initialName]);

    const isNameUnchanged = name === initialName;

    // 이름 변경
    const handleRename = async () => {
        if (!name.trim()) {
            toast.error("이름을 입력해주세요.");
            return;
        }

        try {
            await apiUpdateWorkspace(workspaceCode, name);

            updateWorkspaceName(workspaceCode, name);

            toast.success("워크스페이스 이름이 변경되었습니다.");
            settings.onClose();
        } catch (err) {
            console.error(err);
            toast.error("변경 실패");
        }
    };

    const handleDelete = async () => {

        setIsDeleting(true);
        try {
            await apiDeleteWorkspace(workspaceCode);

            const remainingWorkspaces = workspaces.filter(w => w.inviteCode !== workspaceCode);

            deleteWorkspaceFromStore(workspaceCode);

            toast.success("삭제 완료");
            settings.onClose();
            if (remainingWorkspaces.length > 0) {
                navigate(`/workspace/${remainingWorkspaces[0].inviteCode}`);
            } else {
                navigate("/");
            }
        } catch (err) {
            console.error(err);
            toast.error("삭제 실패");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog open={settings.isOpen} onOpenChange={settings.onClose}>
            <DialogContent>
                <DialogHeader className="border-b pb-3">
                    <DialogTitle>워크스페이스 설정</DialogTitle>
                </DialogHeader>

                <div className="flex items-center justify-between py-2">
                    <div className="flex flex-col gap-y-1">
                        <Label>모드</Label>
                        <span className="text-[0.8rem] text-muted-foreground">
                            Coope가 당신에게 어떻게 보일지 골라보세요!
                        </span>
                    </div>
                    <ModeToggle />
                </div>

                <div className="space-y-2 pt-4">
                    <Label htmlFor="name">워크스페이스 이름</Label>
                    <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="이름을 입력하세요"
                    />
                    <Button
                        onClick={handleRename}
                        className="mt-2 w-full"
                        disabled={!name.trim() || isNameUnchanged}
                    >
                        이름 변경
                    </Button>
                </div>

                <div className="pt-6">
                    <Label className="text-destructive font-bold">Danger Zone</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                        {isLastWorkspace
                            ? "마지막 워크스페이스는 삭제할 수 없습니다. (최소 1개 유지 필요)"
                            : "삭제하면 복구할 수 없습니다."}
                    </p>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="destructive"
                                className="w-full"
                                disabled={isDeleting || isLastWorkspace || isLoading}
                            >
                                {isLastWorkspace ? "삭제 불가" : "워크스페이스 삭제"}
                            </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    이 작업은 되돌릴 수 없습니다. 모든 문서와 멤버 정보가 영구적으로 삭제됩니다.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>취소</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="bg-destructive hover:bg-destructive/90 text-white"
                                >
                                    삭제
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
                <DialogFooter />
            </DialogContent>
        </Dialog>
    );
}