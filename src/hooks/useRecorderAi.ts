import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { apiCreateDocument, apiGetSidebarDocuments } from "@/api/documentApi";
import { useCallStore } from "@/store/useCallStore";

export const useRecorderAi = (mixedAudioStream: MediaStream | null) => {
    const [recording, setRecording] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [pendingAudio, setPendingAudio] = useState<Blob | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const isHandledRef = useRef(false);

    const navigate = useNavigate();
    const { workspaceCode } = useCallStore(); // URL이 아닌 통화 시작 시 고정된 코드 사용

    const handleRecord = async () => {
        if (!recording) {
            if (!mixedAudioStream) {
                toast.error("오디오 스트림을 찾을 수 없습니다.");
                return;
            }
            audioChunksRef.current = [];

            // 브라우저 지원 코덱 확인 (WebM/Opus)
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : 'audio/ogg;codecs=opus';

            const mediaRecorder = new MediaRecorder(mixedAudioStream, { mimeType });

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                setPendingAudio(audioBlob);
            };

            mediaRecorder.start();
            mediaRecorderRef.current = mediaRecorder;
            setRecording(true);
        } else {
            setRecording(false);
            setProcessing(true);
            mediaRecorderRef.current?.stop();
        }
    };

    useEffect(() => {
        const processAudio = async () => {
            if (!processing || !pendingAudio || isHandledRef.current || !workspaceCode) return;
            isHandledRef.current = true;

            try {
                // Spring Boot로 파일 전송 (FormData 사용)
                const formData = new FormData();
                formData.append("file", pendingAudio, "voice_meeting.webm");
                formData.append("workspaceCode", workspaceCode);

                const SERVER_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

                // Spring 백엔드 엔드포인트 호출 (STT + 요약 통합 처리)
                const response = await fetch(`${SERVER_URL}/api/ai/process-voice`, {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) throw new Error('AI 서버 응답 실패');
                const result = await response.json();

                // "통화 녹음" 폴더(부모 문서) 관리
                const sidebarDocs = await apiGetSidebarDocuments(workspaceCode);
                const PARENT_TITLE = "통화 녹음";
                const existingParent = sidebarDocs.find(doc => doc.title === PARENT_TITLE);

                let parentId = existingParent?.id;
                if (!existingParent) {
                    const newParent = await apiCreateDocument({
                        title: PARENT_TITLE,
                        workspaceCode,
                    });
                    parentId = newParent.id;
                }

                // AI 결과로 문서 생성 (Spring 규격에 맞춤)
                const now = new Date();
                const title = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} 통화 요약`;

                // BlockNote 등 에디터 포맷에 맞춘 content 구성
                const content = JSON.stringify([
                    { id: "s1", type: "paragraph", content: [{ type: "text", text: "AI 요약:", styles: { bold: true } }] },
                    { id: "s2", type: "paragraph", content: [{ type: "text", text: result.summary, styles: {} }] },
                    { id: "s3", type: "paragraph", content: [{ type: "text", text: "---", styles: {} }] },
                    { id: "s4", type: "paragraph", content: [{ type: "text", text: "전체 스크립트:", styles: { bold: true } }] },
                    { id: "s5", type: "paragraph", content: [{ type: "text", text: result.transcript, styles: {} }] }
                ]);

                const newDoc = await apiCreateDocument({
                    title,
                    workspaceCode,
                    parentId: parentId,
                    content
                });

                toast.success("통화 내용이 정리되었습니다.");
                navigate(`/workspace/${workspaceCode}/documents/${newDoc.id}`);

            } catch (error) {
                console.error('AI 처리 중 오류:', error);
                toast.error('오디오 처리 중 오류가 발생했습니다.');
            } finally {
                setProcessing(false);
                setPendingAudio(null);
                isHandledRef.current = false;
            }
        };

        processAudio();
    }, [processing, pendingAudio, workspaceCode, navigate]);

    return { recording, processing, handleRecord };
};