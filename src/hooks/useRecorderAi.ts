import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { apiCreateDocument, apiGetSidebarDocuments } from "@/api/documentApi";
import { useCallStore } from "@/store/useCallStore";
import axiosAuthInstance from "@/api/axiosAuthInstance";

const AI_PROCESS_TIMEOUT = 180000;

export const useRecorderAi = (mixedAudioStream: MediaStream | null) => {
    const [recording, setRecording] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [pendingAudio, setPendingAudio] = useState<Blob | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const isHandledRef = useRef(false);

    const navigate = useNavigate();
    const { workspaceCode } = useCallStore();
    const autoStopTimeoutRef = useRef<number | null>(null);
    const [remainingTime, setRemainingTime] = useState<number>(300);
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        // 컴포넌트가 사라질 때(Unmount) 실행되는 함수
        return () => {
            if (autoStopTimeoutRef.current) {
                window.clearTimeout(autoStopTimeoutRef.current);
                autoStopTimeoutRef.current = null;
            }
            if (intervalRef.current) {
                window.clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, []);



    const handleRecord = async () => {
        if (!recording) {
            if (!mixedAudioStream) {
                toast.error("오디오 스트림을 찾을 수 없습니다.");
                return;
            }
            audioChunksRef.current = [];

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

            setRemainingTime(300);

            intervalRef.current = window.setInterval(() => {
                setRemainingTime(prev => {
                    if (prev <= 1) {
                        if (intervalRef.current) clearInterval(intervalRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            autoStopTimeoutRef.current = window.setTimeout(() => {
                if (mediaRecorderRef.current?.state === "recording") {
                    toast.info("5분이 지나 자동으로 녹음을 종료합니다.");
                    setRecording(false);
                    setProcessing(true);

                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                    }

                    mediaRecorderRef.current.stop();
                }
            }, 5 * 60 * 1000);
        } else {
            setRecording(false);
            setProcessing(true);

            if (autoStopTimeoutRef.current) {
                clearTimeout(autoStopTimeoutRef.current);
                autoStopTimeoutRef.current = null;
            }

            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }

            mediaRecorderRef.current?.stop();
        }
    };

    useEffect(() => {
        const processAudio = async () => {
            if (!processing || !pendingAudio || isHandledRef.current || !workspaceCode?.trim()) return;
            isHandledRef.current = true;

            try {


                // Spring Boot로 파일 전송 (FormData 사용)
                const formData = new FormData();
                formData.append("file", pendingAudio, "voice_meeting.webm");
                formData.append("workspaceCode", workspaceCode);


                // Spring 백엔드 엔드포인트 호출 (STT + 요약 통합 처리)
                const response = await axiosAuthInstance.post("/ai/process-voice", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                    timeout: AI_PROCESS_TIMEOUT
                });

                const result = response.data;

                // 통화 녹음 폴더(부모 문서) 관리
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

    return { recording, processing, handleRecord, remainingTime };
};