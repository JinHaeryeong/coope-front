import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/useAuthStore";
import { useFriendStore } from "@/store/useFriendStore";

import AddFriend from "@/components/Main/Friends/AddFriend";
import FriendRequestList from "@/components/Main/Friends/FriendRequestList";
import { FriendProvider } from "@/components/provider/FriendProvider";
import FriendPageContent from "@/components/Main/Friends/FriendPageContent";

const FriendsPage = () => {
    const { user } = useAuthStore();
    const { friends, isLoading, fetchFriends } = useFriendStore();


    useEffect(() => {
        if (user) fetchFriends();
    }, [user, fetchFriends]);

    if (!user) return null;

    // 로딩 중 스켈레톤
    if (isLoading) {
        return (
            <div className="md:max-w-3xl lg:max-w-4xl mx-auto mt-10 space-y-4 pl-8 pt-4">
                <Skeleton className="h-14 w-[50%]" />
                <Skeleton className="h-14 w-[80%]" />
            </div>
        );
    }

    // 친구가 한 명도 없을 때
    if (!friends || friends.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center space-y-4 bg-background">
                <div className="relative w-72 h-72">
                    <img
                        src="/robot.png"
                        className="object-contain dark:hidden w-full h-full"
                        alt="empty-friends"
                    />
                    <img
                        src="/robot_dark.png"
                        className="object-contain hidden dark:block w-full h-full"
                        alt="empty-friends-dark"
                    />
                </div>

                <h2 className="text-lg font-medium text-muted-foreground">
                    대화할 친구가 없어요. 새로운 친구를 추가해볼까요?
                </h2>
                <div className="flex gap-2">
                    <AddFriend onSuccess={fetchFriends} />
                    <FriendRequestList onSuccess={fetchFriends} />
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-background overflow-hidden">
            <FriendProvider initialFriends={friends}>
                <FriendPageContent />
                {/* <div>ㅈㅁ</div> */}
            </FriendProvider>
        </div>
    );
};

export default FriendsPage;