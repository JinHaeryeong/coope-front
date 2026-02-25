import { useEffect, useRef, useState, useMemo } from "react";
import { Video, VideoOff, Mic, MicOff, ScreenShare, ScreenShareOff, NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";

// 커스텀 훅 임포트

import { useCallStore } from "@/store/useCallStore";
import { useMediasoup, type RemoteStreamInfo } from "@/hooks/useMediasoup";
import { useRecorderAi } from "@/hooks/useRecorderAi";
import { useAiUsageStore } from "@/store/useAiUsageStore";

/**
 * 상대방 영상 렌더링 컴포넌트
 */
function RemoteVideo({ info, className }: { info: RemoteStreamInfo; className?: string }) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && info.stream) {
            videoRef.current.srcObject = info.stream;
        }
    }, [info.stream]);

    return <video ref={videoRef} autoPlay playsInline className={className} title="Remote participant video" />;
}

/**
 * 내 영상(로컬) 렌더링 컴포넌트
 */
function LocalVideo({ stream, className, muted = true }: { stream: MediaStream | null, className?: string, muted?: boolean }) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return <video ref={videoRef} autoPlay muted={muted} playsInline className={className} title="My video preview" />;
}



export default function WebRtcComponent({ roomId }: { roomId: string }) {
    const { isFullScreen } = useCallStore();

    const isMobile = useMemo(() => {
        if (typeof window === "undefined") return false;
        // 1. 터치 기기이면서 2. 화면공유 API가 없거나 제한적인 경우
        return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    }, []);

    const {
        streams,
        remoteStreams,
        camEnabled,
        micEnabled,
        toggleCamera,
        toggleScreen,
        toggleMic,
    } = useMediasoup(roomId);

    const audioContextRef = useRef<AudioContext | null>(null);
    const { sttRemaining } = useAiUsageStore();

    useEffect(() => {
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
                audioContextRef.current = null;
            }
        };
    }, []);


    const mixedAudioStream = useMemo(() => {
        // 마이크와 원격 스트림이 모두 없으면 null 반환
        if (!streams.mic && remoteStreams.length === 0) return null;

        // AudioContext가 없으면 생성 (싱글톤 패턴)
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
                latencyHint: 'interactive', // 지연 시간 최적화
            });
        }

        const ctx = audioContextRef.current;
        const destination = ctx.createMediaStreamDestination();

        // 내 마이크 소리 연결 (에코 취소 등은 getUserMedia 단계에서 처리됨)
        if (streams.mic) {
            const localSource = ctx.createMediaStreamSource(streams.mic);
            localSource.connect(destination);
        }

        // 상대방들 소리 연결
        remoteStreams.forEach((remote) => {
            if (remote.stream.getAudioTracks().length > 0) {
                const remoteSource = ctx.createMediaStreamSource(remote.stream);
                remoteSource.connect(destination);
            }
        });

        return destination.stream;
    }, [streams.mic, remoteStreams]);

    const { recording, processing, handleRecord, remainingTime } = useRecorderAi(mixedAudioStream);
    const [pinnedProducerId, setPinnedProducerId] = useState<string | "local">("");

    // 메인으로 보여줄 스트림 계산 로직
    const mainStream = useMemo(() => {
        const currentMyStream = streams.screen || streams.camera;

        if (pinnedProducerId === "local") return { stream: currentMyStream, type: "local" };
        if (pinnedProducerId) {
            const pinned = remoteStreams.find(s => s.producerId === pinnedProducerId);
            if (pinned) return pinned;
        }

        return (
            remoteStreams.find((s) => s.type === "screen") ||
            (streams.screen ? { stream: streams.screen, type: "screen" } : null) ||
            remoteStreams.find((s) => s.type === "camera") ||
            (streams.camera ? { stream: streams.camera, type: "camera" } : null)
        );
    }, [pinnedProducerId, remoteStreams, streams.screen, streams.camera]);

    const mainId = useMemo(() => {
        if (!mainStream) return null;
        return "producerId" in mainStream ? mainStream.producerId : "local";
    }, [mainStream]);

    // 하단 썸네일 노출 로직
    const currentMyStream = streams.screen || streams.camera;
    const thumbnails = remoteStreams.filter(s => s.producerId !== mainId);
    const showLocalInThumb = mainId !== "local" && !!currentMyStream;
    const showThumbnailStrip = thumbnails.length > 0 || showLocalInThumb;

    const isEmptyMain = !mainStream;

    const handleRecordWithContext = async () => {
        if (audioContextRef.current?.state === "suspended") {
            await audioContextRef.current.resume();
        }

        // 기존 handleRecord 호출
        handleRecord();
    };

    // AI 기록 버튼 스타일
    const recordBtnStyles = useMemo(() => {
        if (processing) return { color: "bg-orange-500", label: "요약 중..." };
        if (recording) return { color: "bg-red-600 animate-pulse", label: "기록 중지" };
        if (sttRemaining <= 0) return { color: "bg-neutral-800 text-neutral-500 cursor-not-allowed", label: "오늘 횟수 소진" };
        return { color: "bg-black", label: `AI 기록 (${sttRemaining}회 남음)` };
    }, [processing, recording, sttRemaining]);

    return (
        <div className={`relative w-full h-full rounded-md md:rounded-2xl overflow-hidden bg-neutral-950 flex flex-col items-center justify-center transition-all duration-500 ${isEmptyMain && !isFullScreen ? "aspect-video min-h-100" : ""
            } border border-white/5 shadow-2xl`}>

            {/* 메인 뷰 영역 */}
            <div className="flex-1 min-h-0 w-full bg-black relative flex items-center justify-center overflow-hidden">
                {mainStream ? (
                    <div className="w-full h-full relative group flex justify-center items-center">
                        {"producerId" in mainStream ? (
                            <RemoteVideo info={mainStream as RemoteStreamInfo} className="max-w-full max-h-full w-auto h-auto object-contain" />
                        ) : (
                            <LocalVideo stream={currentMyStream} className="max-w-full max-h-full w-auto h-auto object-contain" />
                        )}

                        {pinnedProducerId && (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setPinnedProducerId("")}
                                className="absolute top-4 right-4 rounded-full bg-black/40 backdrop-blur-md border-white/10 text-white hover:bg-black/60 transition-opacity opacity-0 group-hover:opacity-100"
                            >
                                고정 해제
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-6 text-neutral-600">
                        <div className="relative w-24 h-24 rounded-full bg-neutral-900 flex items-center justify-center border border-white/5">
                            <Video className="w-12 h-12 opacity-30" />
                        </div>
                        <div className="text-center px-6">
                            <h3 className="text-lg font-semibold text-neutral-400">대화 준비 중</h3>
                            <p className="text-sm opacity-50 mt-1">카메라나 화면 공유를 켜고 소통을 시작해보세요.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* 썸네일 스트립 */}
            {showThumbnailStrip && (
                <div className="flex items-center gap-3 overflow-x-auto py-3 px-4 h-32 md:h-40 scrollbar-hide shrink-0 w-full bg-neutral-900/50 backdrop-blur-sm border-t border-white/5">
                    {showLocalInThumb && (
                        <div
                            onClick={() => setPinnedProducerId("local")}
                            className="relative shrink-0 w-32 md:w-48 aspect-video bg-neutral-800 rounded-xl overflow-hidden border-2 border-transparent hover:border-blue-500/50 cursor-pointer shadow-xl transition-all"
                        >
                            <LocalVideo stream={currentMyStream} className="w-full h-full object-cover" />
                            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white">나</div>
                        </div>
                    )}

                    {thumbnails.map((info) => (
                        <div
                            key={info.producerId}
                            onClick={() => setPinnedProducerId(info.producerId)}
                            className="relative shrink-0 w-32 md:w-48 aspect-video bg-neutral-800 rounded-xl overflow-hidden border border-white/5 hover:border-blue-500/50 cursor-pointer group transition-all"
                        >
                            <RemoteVideo info={info} className="w-full h-full object-cover" />
                            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white">참여자</div>
                        </div>
                    ))}
                </div>
            )}

            {/* 컨트롤 바 */}
            <div className="flex justify-center items-center gap-2 md:gap-4 w-full py-2 md:py-4 bg-neutral-900/80 border-t border-white/5 backdrop-blur-md">
                <Button
                    variant={camEnabled ? "default" : "outline"}
                    size="icon"
                    onClick={toggleCamera}
                    className="rounded-full w-10 h-10 md:w-12 md:h-12 shadow-lg"
                >
                    {camEnabled ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </Button>

                {!isMobile && (
                    <Button
                        variant={streams.screen ? "default" : "outline"}
                        size="icon"
                        onClick={toggleScreen}
                        className="rounded-full w-10 h-10 md:w-12 md:h-12 shadow-lg"
                    >
                        {streams.screen ? <ScreenShareOff className="w-5 h-5" /> : <ScreenShare className="w-5 h-5" />}
                    </Button>
                )}

                <Button
                    variant={micEnabled ? "default" : "outline"}
                    size="icon"
                    onClick={toggleMic}
                    className="rounded-full w-10 h-10 md:w-12 md:h-12 shadow-lg"
                >
                    {micEnabled ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>

                <div className="w-px h-8 bg-white/10 mx-1 md:mx-2" />

                <Button
                    onClick={handleRecordWithContext}
                    disabled={processing || sttRemaining <= 0}
                    className={`rounded-full px-4 md:px-6 h-10 md:h-12 text-xs md:text-sm font-semibold transition-all shadow-xl ${recordBtnStyles.color}`}
                >
                    <NotebookPen className="w-4 h-4 mr-2" />
                    {recordBtnStyles.label}
                </Button>
                {recording && (
                    <span className="text-xs text-white/70 ml-2">
                        {Math.floor(remainingTime / 60)}:
                        {(remainingTime % 60).toString().padStart(2, "0")}
                    </span>
                )}

            </div>
        </div>
    );
}