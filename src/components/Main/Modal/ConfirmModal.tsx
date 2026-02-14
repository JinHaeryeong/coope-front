import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog';

type ConfirmModalProps = {
    children: React.ReactNode;
    onConfirm: () => void;
    documentId?: number;
    workspaceCode?: string;
    onOpenChange?: (open: boolean) => void;
};

export function ConfirmModal({
    children,
    onConfirm,
    documentId,
    workspaceCode,
    onOpenChange

}: ConfirmModalProps) {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const handleConfirm = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation();

        // 현재 페이지가 삭제 대상일 때만 이동
        if (documentId && workspaceCode && pathname.includes(String(documentId))) {
            navigate(`/workspace/${workspaceCode}`);
        }

        onConfirm();
    };

    return (
        <AlertDialog onOpenChange={onOpenChange}>
            <AlertDialogTrigger onClick={e => e.stopPropagation()} asChild>
                {children}
            </AlertDialogTrigger>
            <AlertDialogContent onClick={e => e.stopPropagation()}>
                <AlertDialogHeader>
                    <AlertDialogTitle>정말로 삭제하시겠습니까?</AlertDialogTitle>
                    <AlertDialogDescription>
                        이 작업은 되돌릴 수 없으며, 해당 데이터가 영구적으로 제거됩니다.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={e => e.stopPropagation()}>
                        취소
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirm}>
                        확인
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}