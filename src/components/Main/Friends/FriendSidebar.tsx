import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare, Search, UsersRound } from "lucide-react";

import { useFriend } from "@/components/provider/FriendProvider";
import FriendRequestList from "./FriendRequestList";
import AddFriend from "./AddFriend";
import FriendListItem from "./FriendListItem";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { apiCreateGroupRoom } from "@/api/chatApi";
import { useFriendStore } from "@/store/useFriendStore";
import { toast } from "sonner";

export const FriendSidebar = () => {
    const {
        friendsList,
        onFriendClick,
        selectedRoom,
        chatRooms,
        fetchChatRooms,
        hasMoreRooms,
        setSelectedRoom
    } = useFriend();
    const [activeTab, setActiveTab] = useState<"FRIENDS" | "CHATS">("FRIENDS");
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFriendIds, setSelectedFriendIds] = useState<number[]>([]);

    const [newRoomName, setNewRoomName] = useState("");

    const filteredFriends = friendsList?.filter(friend =>
        friend.nickname.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredChatRooms = chatRooms?.filter(room =>
        room.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const handleCreateGroup = async () => {
        if (selectedFriendIds.length === 0) return;

        try {
            // 백엔드 API 호출 (우리가 만든 DTO 규격 그대로!)
            const roomData = await apiCreateGroupRoom(selectedFriendIds, newRoomName);

            // 생성된 방으로 바로 이동
            setSelectedRoom({
                roomId: roomData.roomId,
                title: roomData.title,
                type: "GROUP"
            });

            // 초기화
            setIsSelectionMode(false);
            setSelectedFriendIds([]);
            setNewRoomName("");
            fetchChatRooms();
        } catch (error) {
            console.error("그룹 방 생성 실패:", error);
            toast.error("그룹방 생성을 실패했습니다. 잠시  후 다시 시도해주세요.")
        }
    };

    const handleTabChange = (tab: "FRIENDS" | "CHATS") => {
        setActiveTab(tab);
        if (tab === "CHATS") {
            fetchChatRooms();
        }
    };

    const toggleFriendSelection = (id: number) => {
        setSelectedFriendIds(prev =>
            prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
        );
    };

    return (
        <div className="h-full p-3 pt-8 relative flex flex-col bg-card">
            {/* 상단 탭 전환 메뉴 */}
            <div className="flex gap-2 mb-6 p-1 bg-muted rounded-lg">
                <Button variant={activeTab === "FRIENDS" ? "default" : "ghost"} className="flex-1 text-xs" size="sm" onClick={() => handleTabChange("FRIENDS")}>
                    <Users className="w-4 h-4 mr-2" /> 친구
                </Button>
                <Button variant={activeTab === "CHATS" ? "default" : "ghost"} className="flex-1 text-xs" size="sm" onClick={() => handleTabChange("CHATS")}>
                    <MessageSquare className="w-4 h-4 mr-2" /> 채팅
                </Button>
            </div>

            {/* 헤더 부분: 선택 모드일 때 '취소' 버튼 노출 */}
            <div className="flex items-center mb-4 h-9">
                <div className="font-bold text-lg">
                    {activeTab === "FRIENDS" ? "내 친구" : "채팅 목록"}
                </div>
                <div className="ml-auto">
                    {activeTab === "FRIENDS" && (
                        isSelectionMode ? (
                            <Button variant="link" size="sm" onClick={() => { setIsSelectionMode(false); setSelectedFriendIds([]); }}>취소</Button>
                        ) : (
                            <FriendRequestList onSuccess={() => useFriendStore.getState().fetchFriends()} />
                        )
                    )}
                </div>
            </div>

            <div className="relative mb-4">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="이름이나 이메일 검색..."
                    className="pl-8 h-9 text-xs"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* 리스트 영역 */}
            <ScrollArea className="flex-1 -mx-2 px-2">
                {activeTab === "FRIENDS" ? (
                    <div className="space-y-1">
                        {filteredFriends?.map((friend: any) => (
                            <FriendListItem
                                key={friend.friendId}
                                friend={friend}
                                // 선택 모드면 체크박스 작동, 아니면 방 입장
                                onClick={() => isSelectionMode ? toggleFriendSelection(friend.friendId) : onFriendClick(friend)}
                                isSelected={selectedRoom?.roomId === friend.roomId || selectedFriendIds.includes(friend.friendId)}
                                showCheckbox={isSelectionMode} // 체크박스 노출 여부
                                onCheckboxChange={() => toggleFriendSelection(friend.friendId)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-1">
                        {filteredChatRooms?.length > 0 ? (
                            chatRooms.map((room) => (
                                <div
                                    key={room.roomId}
                                    onClick={() => setSelectedRoom(room as NonNullable<typeof selectedRoom>)}
                                    className={cn(
                                        "group flex items-center gap-x-3 p-3 rounded-xl cursor-pointer transition-all",
                                        "hover:bg-accent/50",
                                        selectedRoom?.roomId === room.roomId ? "bg-accent" : ""
                                    )}
                                >
                                    <Avatar>
                                        <AvatarFallback>{room.title.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col overflow-hidden flex-1">
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-sm truncate">{room.title}</span>
                                            {room.lastMessageTime && (
                                                <span className="text-[10px] text-muted-foreground">
                                                    {new Date(room.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {room.lastMessage || "대화 내용이 없습니다."}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-xs text-muted-foreground">
                                참여 중인 채팅방이 없습니다.
                            </div>
                        )}

                        {hasMoreRooms && (
                            <Button
                                variant="ghost"
                                className="w-full text-[10px]"
                                onClick={() => fetchChatRooms(true)}
                            >
                                이전 대화 더보기
                            </Button>
                        )}
                    </div>
                )}
            </ScrollArea>

            {/* 하단 추가 섹션 */}
            <div className={cn(
                "mt-auto pt-4 border-t transition-all duration-300",
                isSelectionMode ? "h-auto pb-4" : "h-14"
            )}>
                <div className="flex items-center justify-between gap-x-2">
                    {isSelectionMode ? (
                        <div className="flex flex-col gap-2 w-full">
                            <Input
                                placeholder="방 이름 (미입력 시 자동 생성)"
                                value={newRoomName}
                                onChange={(e) => setNewRoomName(e.target.value)}
                                className="h-8 text-[11px]"
                            />
                            <Button
                                className="w-full"
                                disabled={selectedFriendIds.length === 0}
                                onClick={handleCreateGroup}
                            >
                                {selectedFriendIds.length}명과 방 만들기
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="text-[10px] md:text-xs font-medium text-muted-foreground leading-tight">
                                {activeTab === "FRIENDS" ? <>새로운 인연을<br />찾아보세요</> : <>새로운 대화방을<br />열어보세요</>}
                            </div>
                            {activeTab === "FRIENDS" ? (
                                <AddFriend onSuccess={() => useFriendStore.getState().fetchFriends()} />
                            ) : (
                                <Button onClick={() => { setActiveTab("FRIENDS"); setIsSelectionMode(true); }}>
                                    <UsersRound />
                                    방 만들기
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};