import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronsLeftRight, Check, Plus, LogOut } from "lucide-react";
import { toast } from "sonner";

import { useAuthStore } from "@/store/useAuthStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiCreateWorkspace } from "@/api/workspaceApi";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

interface UserItemProps {
    onOpenDialog: (callback: () => void) => void;
}

function UserItem({ onOpenDialog }: UserItemProps) {
    const { user, signOut } = useAuthStore();
    const navigate = useNavigate();
    const { workspaceCode } = useParams<{ workspaceCode: string }>();

    const { workspaces, fetchWorkspaces, addWorkspace } = useWorkspaceStore();
    const currentWorkspace = workspaces.find(w => w.inviteCode === workspaceCode);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchWorkspaces();
        }
    }, [user, fetchWorkspaces]);

    const handleWorkspaceCreateClick = () => {
        onOpenDialog(() => setIsDialogOpen(true));
    };

    const handleCreate = async () => {
        if (!name.trim()) {
            toast.error("이름을 입력해주세요.");
            return;
        }

        setIsLoading(true);
        try {
            const newWorkspace = await apiCreateWorkspace(name);
            addWorkspace(newWorkspace);

            setIsDialogOpen(false);
            setName("");
            toast.success("워크스페이스가 생성되었습니다.");

            navigate(`/workspace/${newWorkspace.inviteCode}`);
        } catch (err) {
            toast.error("워크스페이스 생성 실패");
        } finally {
            setIsLoading(false);
        }
    };

    const onSignOut = () => {
        signOut();
        navigate("/");
    };

    const handleWorkspaceSelect = (inviteCode: string) => {
        navigate(`/workspace/${inviteCode}`);
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div
                        role="button"
                        className="flex items-center text-sm p-3 w-full transition justify-between hover:bg-white/5 rounded-lg"
                    >
                        <div className="flex items-center md:max-w-37.5 gap-x-2">
                            <Avatar className="h-5 w-5 rounded-full">
                                <AvatarImage src={user?.userIcon} alt={user?.nickname} />
                                <AvatarFallback className="bg-sky-500 text-white">
                                    {user?.nickname?.charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col text-start">
                                <span className="text-white font-medium line-clamp-1 leading-tight">
                                    {user?.nickname}&apos;s Coope
                                </span>
                                <span className="text-[13px] text-muted-foreground line-clamp-1 font-normal leading-tight">
                                    {currentWorkspace?.name || "개인 워크스페이스"}
                                </span>
                            </div>
                        </div>
                        <ChevronsLeftRight className="rotate-90 ml-2 text-muted-foreground h-4 w-4 cursor-pointer" />
                    </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-80 z-[1001]" align="start" alignOffset={11} forceMount>
                    <div className="flex flex-col space-y-4 p-2">
                        <p className="text-xs font-medium leading-none text-muted-foreground">
                            {user?.email}
                        </p>
                        <div className="flex items-center gap-x-2">
                            <div className="rounded-lg p-1">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user?.userIcon} alt={user?.nickname} />
                                    <AvatarFallback className="bg-sky-500 text-white">
                                        {user?.nickname?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm">{user?.nickname}&apos;s Coope</p>
                            </div>
                        </div>
                    </div>

                    <DropdownMenuSeparator />

                    <div className="max-h-50 overflow-y-auto">
                        {workspaces.map((workspace) => (
                            <DropdownMenuItem
                                key={workspace.id}
                                onClick={() => handleWorkspaceSelect(workspace.inviteCode)}
                                className="cursor-pointer flex items-center justify-between"
                            >
                                <span className="truncate">{workspace.name}</span>
                                {workspace.inviteCode === workspaceCode && (
                                    <Check className="h-4 w-4 text-green-600" />
                                )}
                            </DropdownMenuItem>
                        ))}
                    </div>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        onClick={handleWorkspaceCreateClick}
                        className="cursor-pointer font-medium text-primary hover:bg-primary/10"
                    >
                        <Plus className="h-4 w-4 mr-2 text-primary" />
                        새 워크스페이스 생성
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        className="w-full cursor-pointer text-destructive"
                        onClick={onSignOut}
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        로그아웃
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="z-[999]">
                    <DialogHeader>
                        <DialogTitle>새 워크스페이스 만들기</DialogTitle>
                    </DialogHeader>
                    <div className="py-2">
                        <Input
                            placeholder="워크스페이스 이름"
                            value={name}
                            disabled={isLoading}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" disabled={isLoading}>취소</Button>
                        </DialogClose>
                        <Button onClick={handleCreate} disabled={isLoading}>
                            {isLoading ? "생성 중..." : "생성"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default UserItem;