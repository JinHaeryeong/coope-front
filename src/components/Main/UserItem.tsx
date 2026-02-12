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
import { apiCreateWorkspace, apiGetMyWorkspaces } from "@/api/workspaceApi";



interface Workspace {
    id: number;
    name: string;
    inviteCode: string;
}

function UserItem() {
    const { user, signOut } = useAuthStore();
    const navigate = useNavigate();
    const { workspaceId } = useParams<{ workspaceId: string }>();

    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchWorkspaces = async () => {
            try {
                const response = await apiGetMyWorkspaces();
                setWorkspaces(response);
            } catch (err) {
                console.error("워크스페이스 로딩 실패:", err);
            }
        };

        if (user) fetchWorkspaces();
    }, [user]);

    const handleCreate = async () => {
        if (!name.trim()) {
            toast.error("이름을 입력해주세요.");
            return;
        }

        setIsLoading(true);
        try {
            const newWorkspace = await apiCreateWorkspace(name);
            setWorkspaces((prev) => [...prev, newWorkspace]);
            setIsDialogOpen(false);
            setName("");
            toast.success("워크스페이스가 생성되었습니다.");

            // 생성 후 해당 워크스페이스의 문서함으로 이동
            navigate(`/workspace/${newWorkspace.inviteCode}`);
        } catch (err) {
            console.error(err);
            toast.error("워크스페이스 생성 실패");
        } finally {
            setIsLoading(false);
        }
    };
    const onSignOut = () => {
        signOut();
        navigate("/");
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div
                        role="button"
                        className="flex items-center text-sm p-3 w-full transition justify-between"
                    >
                        <div className="flex items-center md:max-w-37.5 gap-x-2">
                            <Avatar className="h-5 w-5 rounded-full">
                                <AvatarImage src={user?.userIcon} alt={user?.nickname} />
                                <AvatarFallback className="bg-sky-500 text-white">
                                    {user?.nickname?.charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-start font-medium line-clamp-1 text-white">
                                {user?.nickname}&apos;s Coope
                            </span>
                        </div>
                        <ChevronsLeftRight className="rotate-90 ml-2 text-muted-foreground h-4 w-4 cursor-pointer" />
                    </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-80" align="start" alignOffset={11} forceMount>
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

                    {/* 워크스페이스 리스트 영역 */}
                    <div className="max-h-50 overflow-y-auto">
                        {workspaces.map((workspace) => (
                            <DropdownMenuItem
                                key={workspace.id}
                                onClick={() => navigate(`/workspace/${workspace.inviteCode}`)}
                                className="cursor-pointer flex items-center justify-between"
                            >
                                <span className="truncate">{workspace.name}</span>
                                {workspace.inviteCode === workspaceId && (
                                    <Check className="h-4 w-4 text-green-600" />
                                )}
                            </DropdownMenuItem>
                        ))}
                    </div>

                    <DropdownMenuSeparator />

                    {/* 워크스페이스 생성 버튼 */}
                    <DropdownMenuItem
                        onClick={() => setIsDialogOpen(true)}
                        className="cursor-pointer font-medium text-primary hover:bg-primary/10"
                    >
                        <Plus className="h-4 w-4 mr-2 text-primary" />
                        새 워크스페이스 생성
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* 로그아웃 버튼 */}
                    <DropdownMenuItem
                        className="w-full cursor-pointer text-destructive"
                        onClick={onSignOut}
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        로그아웃
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* 워크스페이스 생성 Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
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