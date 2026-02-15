import type { FriendResponse } from "@/api/friendApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface FriendListItemProps {
    friend: FriendResponse;
    onClick: () => void;
    isSelected?: boolean;
    showCheckbox?: boolean;
    onCheckboxChange?: (checked: boolean) => void;
}

const FriendListItem = ({
    friend,
    onClick,
    isSelected,
    showCheckbox,
    onCheckboxChange
}: FriendListItemProps) => {
    return (
        <div
            className={cn(
                "group flex items-center gap-x-3 p-3 rounded-xl cursor-pointer transition-all duration-200",
                "hover:bg-accent/50 active:scale-[0.98]",
                isSelected ? "bg-accent shadow-sm" : "transparent"
            )}
            onClick={onClick}
        >
            {/* 그룹 초대 시 체크박스 노출 영역 */}
            {showCheckbox && (
                <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 accent-primary"
                    onChange={(e) => onCheckboxChange?.(e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                />
            )}

            {/* 프로필 이미지 */}
            <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={friend.userIcon} alt="프로필" />
                <AvatarFallback className="bg-primary/10 text-primary">
                    {friend.nickname?.charAt(0) ?? "?"}
                </AvatarFallback>
            </Avatar>

            {/* 정보 텍스트 */}
            <div className="flex flex-col overflow-hidden">
                <span className="font-semibold text-sm truncate">
                    {friend.nickname}
                </span>
            </div>

            {/* 선택 상태 인디케이터 (데스크탑 뷰용) */}
            {isSelected && !showCheckbox && (
                <div className="ml-auto w-1.5 h-1.5 bg-primary rounded-full" />
            )}
        </div>
    );
};

export default FriendListItem;