import { useState, useEffect } from "react";
import { toast } from "sonner";
import { UserRoundPlus, Loader2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { apiSearchUser, type UserSearchResponse } from "@/api/userApi";
import { apiSendFriendRequest } from "@/api/friendApi";

interface UserListProps {
    nickname: string; // 검색할 닉네임
    onActionSuccess?: () => void;
}

const UserList = ({ nickname, onActionSuccess }: UserListProps) => {
    const { user: currentUser } = useAuthStore(); // 현재 로그인한 유저 정보
    const [searchedUser, setSearchedUser] = useState<UserSearchResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [isAlreadyRelated, setIsAlreadyRelated] = useState(false);

    useEffect(() => {
        const search = async () => {
            if (!nickname) return;
            try {
                setIsLoading(true);
                setError("");

                const data = await apiSearchUser(nickname);
                setSearchedUser(data);

                if (data.status && data.status !== "NONE") {
                    setIsAlreadyRelated(true);
                } else {
                    setIsAlreadyRelated(false);
                }
            } catch (err: any) {
                console.error("검색 실패:", err);
                setSearchedUser(null);

                const serverMessage = err.response?.data?.message || "유저를 찾는 중 오류가 발생했습니다.";
                setError(serverMessage);
            } finally {
                setIsLoading(false);
            }
        };

        search();
    }, [nickname]);

    // 친구 신청 로직
    const handleAddFriend = async () => {
        if (!searchedUser || !currentUser) return;

        try {
            // 본인 방어 로직
            if (searchedUser.id === currentUser.id) {
                toast.error("본인에게는 친구 신청을 할 수 없어요.");
                return;
            }

            await apiSendFriendRequest(searchedUser.id);

            toast.success("친구 요청을 보냈습니다!", {
                description: `${searchedUser.nickname}님이 수락하면 대화할 수 있어요.`,
            });

            if (onActionSuccess) onActionSuccess();
        } catch (err: any) {
            // 백엔드에서 던진 "이미 친구입니다" 등의 에러 메시지 처리
            const message = err.response?.data?.message || "친구 신청에 실패했습니다.";
            toast.error(message);
            if (message.includes("이미") || message.includes("관계")) {
                setIsAlreadyRelated(true);
            }
        }
    };

    // 조건부 렌더링
    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-4">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!searchedUser) {
        return <div className="text-center text-sm py-4 text-muted-foreground">유저가 존재하지 않아요 :/</div>;
    }

    if (searchedUser.id === currentUser?.id) {
        return <div className="text-center text-sm py-4 text-muted-foreground">본인은 친구로 추가할 수 없어요</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg bg-secondary/20">
                <div className="flex items-center gap-x-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={searchedUser.userIcon} />
                        <AvatarFallback>{searchedUser.nickname[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold">{searchedUser.nickname}</span>
                    </div>
                </div>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleAddFriend}
                    disabled={isAlreadyRelated}
                    className="hover:bg-primary/10 hover:text-primary"
                >
                    {isAlreadyRelated ? (
                        <span className="text-xs font-normal">신청됨</span>
                    ) : (
                        <UserRoundPlus className="h-5 w-5" />
                    )}
                </Button>
            </div>
            {error && <div className="text-xs text-destructive text-center">{error}</div>}
        </div>
    );
};

export default UserList;