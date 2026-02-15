import { useFriend } from "@/components/provider/FriendProvider";
import { useAuthStore } from "@/store/useAuthStore";
import { FriendSidebar } from "./FriendSidebar";
import { Loader2 } from "lucide-react";
import { ChatWindow } from "./Chat/ChatWindow";

const DesktopFriendView = () => {
    const { selectedRoom } = useFriend();
    const user = useAuthStore((state) => state.user);


    if (!user) {
        return (
            <div className="flex h-full items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">사용자 정보를 확인 중입니다...</span>
            </div>
        );
    }

    return (
        <div className="flex h-full overflow-hidden">
            <div className="w-80 h-full border-r shrink-0 bg-white">
                <FriendSidebar />
            </div>

            <div className="flex-1 h-full bg-[#F9FAFB] dark:bg-[#1F1F1F]">
                {selectedRoom ? (
                    <div className="h-full animate-in fade-in duration-300">
                        <ChatWindow />
                    </div>
                ) : (
                    <div className="flex flex-col h-full items-center justify-center animate-in zoom-in-95 duration-500">
                        <img
                            src="/chat.png"
                            className="h-50 w-80 opacity-80 hover:grayscale-0 transition-all duration-700 object-contain"
                            alt="채팅 안내"
                        />
                        <div className="text-muted-foreground mt-6 font-semibold tracking-tight">
                            친구를 선택하여 대화를 시작해보세요
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DesktopFriendView;