import { type ChangeEvent, useState } from "react";
import { PlusCircle, UserSearch } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import UserList from "./UserList";

interface AddFriendProps {
    onSuccess?: () => void;
}

const AddFriend = ({ onSuccess }: AddFriendProps) => {
    const [searchNickname, setSearchNickname] = useState("");
    const [isSearched, setIsSearched] = useState(false);

    const handleSearchFriend = () => {
        if (!searchNickname.trim()) return;
        setIsSearched(true);
    };

    const onChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchNickname(e.target.value);
        if (isSearched) setIsSearched(false);
    };

    const resetState = () => {
        setIsSearched(false);
        setSearchNickname("");
    };

    return (
        <Dialog onOpenChange={(open) => { if (!open) resetState() }}>
            <DialogTrigger asChild>
                <Button size="sm" className="h-9">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    친구 추가
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>친구 찾기</DialogTitle>
                    <DialogDescription>
                        친구의 닉네임을 입력하여 검색해보세요.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center space-x-2">
                    <div className="grid flex-1 gap-2">
                        <Label htmlFor="nickname" className="sr-only">Nickname</Label>
                        <Input
                            id="nickname"
                            placeholder="닉네임 입력..."
                            value={searchNickname}
                            onChange={onChangeInput}
                            onKeyDown={(e) => e.key === "Enter" && handleSearchFriend()}
                        />
                    </div>
                    <Button type="button" size="icon" onClick={handleSearchFriend}>
                        <UserSearch className="w-5 h-5" />
                    </Button>
                </div>

                <div className="py-6 min-h-36 flex flex-col justify-center border-y my-4">
                    {isSearched ? (
                        <UserList nickname={searchNickname} onActionSuccess={onSuccess} />
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                            검색 결과가 여기에 표시됩니다.
                        </div>
                    )}
                </div>

                <DialogFooter className="flex justify-end gap-x-2">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" className="cursor-pointer">
                            닫기
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddFriend;