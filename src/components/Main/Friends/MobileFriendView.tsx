import { useFriend } from "@/components/provider/FriendProvider";
import { FriendSidebar } from "./FriendSidebar";
import { ChatWindow } from "./Chat/ChatWindow";

const MobileFriendView = () => {
    const { selectedRoom, setSelectedRoom } = useFriend();

    if (!selectedRoom) {
        return (
            <div className="h-full w-full bg-white">
                <FriendSidebar />
            </div>
        );
    }

    return (
        <div className="h-full w-full">
            <ChatWindow
                isMobile={true}
                onBack={() => setSelectedRoom(null)}
            />
        </div>
    );
};

export default MobileFriendView;