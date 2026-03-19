import { useMediaQuery } from "usehooks-ts";
import DesktopFriendView from "./DesktopFriendView";
import MobileFriendView from "./MobileFriendView";

const FriendPageContent = () => {
    const isMobile = useMediaQuery("(max-width: 768px)");

    return (
        <div className="h-full w-full">
            {isMobile ? <MobileFriendView /> : <DesktopFriendView />}
        </div>
    );
};

export default FriendPageContent;