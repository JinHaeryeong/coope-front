import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useInvite } from '@/hooks/useInvite';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type InviteModalProps = {
    workspaceId: string;
};

export default function InviteModal({ workspaceId }: InviteModalProps) {
    const { isOpen, onClose } = useInvite();
    const [inviteUrl, setInviteUrl] = useState('');

    // 컴포넌트 마운트 및 workspaceId 변경 시 초대 링크 생성
    useEffect(() => {

        const origin = window.location.origin;
        setInviteUrl(`${origin}/invite?workspace=${workspaceId}`);
    }, [workspaceId]);

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteUrl);
        toast.success("초대 링크가 복사되었습니다!");
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader className="border-b pb-3">
                    <DialogTitle>워크스페이스에 초대하기</DialogTitle>
                </DialogHeader>

                <div className="flex items-center justify-between py-4">
                    <div className="flex flex-col gap-y-1">
                        <Label className="text-sm font-bold">초대 링크</Label>
                        <span className="text-[0.8rem] text-muted-foreground">
                            공유 가능한 링크를 복사하여 동료에게 전송하세요.
                        </span>
                    </div>
                    <Button size="sm" onClick={handleCopy}>
                        복사하기
                    </Button>
                </div>

                <div className="text-xs p-3 bg-muted rounded font-mono break-all border select-all">
                    {inviteUrl}
                </div>
            </DialogContent>
        </Dialog>
    );
}