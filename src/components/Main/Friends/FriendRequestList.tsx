import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, UserCheck } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuthStore } from "@/store/useAuthStore";
import { apiGetReceivedRequests, apiAcceptFriend, type FriendResponse } from "@/api/friendApi";

interface FriendRequestListProps {
    onSuccess?: () => void;
}

const FriendRequestList = ({ onSuccess }: FriendRequestListProps) => {
    const { user } = useAuthStore();
    const [requests, setRequests] = useState<FriendResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // 나에게 온 친구 요청(PENDING) 목록 가져오기
    const fetchRequests = async () => {
        try {
            setIsLoading(true);
            const data = await apiGetReceivedRequests();
            setRequests(data);
        } catch (error) {
            console.error("요청 목록 로딩 실패:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchRequests();
    }, [user]);

    // 친구 요청 수락 로직
    const handleAccept = async (friendId: number, nickname: string) => {
        try {
            await apiAcceptFriend(friendId);
            toast.success(`${nickname}님의 친구 요청을 수락했습니다.`);

            setRequests((prev) => prev.filter((req) => req.friendId !== friendId));

            if (onSuccess) onSuccess();
        } catch (error: any) {
            const message = error.response?.data?.message || "수락 처리 중 오류가 발생했습니다.";
            toast.error(message);
        }
    };

    if (!user) return null;

    return (
        <div>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="relative">
                        요청 목록
                        {requests.length > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                                {requests.length}
                            </span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                    <div className="grid gap-4">
                        <div className="space-y-1">
                            <h4 className="font-medium leading-none">친구 요청 목록</h4>
                            <p className="text-sm text-muted-foreground">
                                나에게 온 요청을 확인하고 수락해보세요.
                            </p>
                        </div>
                        <div className="grid gap-2 max-h-72 overflow-y-auto">
                            {isLoading ? (
                                <div className="flex justify-center p-4">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : requests.length === 0 ? (
                                <div className="py-4 text-center text-sm text-muted-foreground">
                                    아직 도착한 요청이 없어요 🥲
                                </div>
                            ) : (
                                requests.map((request) => (
                                    <div key={request.id} className="flex items-center justify-between p-2 hover:bg-secondary/20 rounded-lg transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={request.userIcon} alt={request.nickname} />
                                                <AvatarFallback>{request.nickname[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium leading-none">{request.nickname}</span>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => handleAccept(request.friendId, request.nickname)}
                                            className="h-8 px-3"
                                        >
                                            <UserCheck className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default FriendRequestList;