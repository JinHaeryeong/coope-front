import { Suspense, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import { apiJoinWorkspace } from '@/api/workspaceApi';

function InviteContent() {
    const { isLoggedIn } = useAuthStore();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const hasJoined = useRef(false);

    const { workspaceCode } = useParams<{ workspaceCode: string }>();

    useEffect(() => {
        if (!workspaceCode) {
            toast.error('워크스페이스 ID가 없습니다.');
            setIsLoading(false);
            navigate('/');
            return;
        }

        if (!isLoggedIn) {
            toast.error('로그인이 필요한 서비스입니다.');
            navigate(`/`);
            return;
        }

        if (hasJoined.current) return;

        const joinWorkspace = async () => {
            hasJoined.current = true;
            setIsLoading(true);

            try {
                const result = await apiJoinWorkspace(workspaceCode);

                if (result.status === 'already_member') {
                    toast.info('이미 참여 중인 워크스페이스입니다.');
                } else {
                    toast.success('워크스페이스에 참여했습니다!');
                }

                navigate(`/workspace/${workspaceCode}`);
            } catch (err: any) {
                console.error('초대 실패:', err);
                const msg = err.response?.data?.message || '참여 중 오류가 발생했습니다.';
                toast.error(msg);
                navigate('/');
            } finally {
                setIsLoading(false);
            }
        };

        if (isLoggedIn && workspaceCode) {
            joinWorkspace();
        }
    }, [isLoggedIn, workspaceCode, navigate]);

    return (
        <div className="h-full flex items-center justify-center min-h-screen">
            {isLoading ? (
                <div className="flex flex-col items-center gap-4">
                    <Spinner />
                    <p className="text-sm text-muted-foreground">워크스페이스 참여 처리 중...</p>
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">처리가 완료되었습니다.</p>
            )}
        </div>
    );
}

export default function InvitePage() {
    return (
        <Suspense fallback={<div className="h-full flex items-center justify-center"><Spinner /></div>}>
            <InviteContent />
        </Suspense>
    );
}