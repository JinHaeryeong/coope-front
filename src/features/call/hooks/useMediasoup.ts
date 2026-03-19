import { useCallback, useEffect, useRef, useState } from "react";
import 'webrtc-adapter';
import io from "socket.io-client";
import { Device as MediaDevice } from "mediasoup-client";
import type {
    RtpCapabilities,
    TransportOptions,
    MediaKind,
    AppData,
    Transport,
} from "mediasoup-client/types";
import { toast } from "sonner";

type StreamType = "camera" | "screen" | "mic";

type ProducerInfo = {
    producerId: string;
    kind: MediaKind;
    appData: AppData & { type: StreamType };
    socketId: string;
};

export interface RemoteStreamInfo {
    producerId: string;
    socketId: string;
    type: StreamType;
    stream: MediaStream;
}

interface UseMediasoupReturn {
    streams: {
        camera: MediaStream | null;
        screen: MediaStream | null;
        mic: MediaStream | null;
    };
    remoteStreams: RemoteStreamInfo[];
    camEnabled: boolean;
    micEnabled: boolean;
    hasRemoteScreenShare: boolean;
    localVideoRef: React.RefObject<HTMLVideoElement | null>;
    toggleCamera: () => void;
    toggleScreen: () => void;
    toggleMic: () => Promise<void>;
}

export const useMediasoup = (
    roomId: string,
    onRemoteVideoStream?: (stream: MediaStream) => void
): UseMediasoupReturn => {
    const socketRef = useRef<ReturnType<typeof io> | null>(null);
    const deviceRef = useRef<MediaDevice | null>(null);
    const sendTransportRef = useRef<Transport | null>(null);
    const recvTransportRef = useRef<Transport | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);

    const handleNewProducerRef = useRef<((info: ProducerInfo) => Promise<void>) | null>(null);
    const retryTimersRef = useRef<Record<string, any>>({});
    const retryCountsRef = useRef<Record<string, number>>({});

    const [streams, setStreams] = useState({
        camera: null as MediaStream | null,
        screen: null as MediaStream | null,
        mic: null as MediaStream | null,
    });
    const [remoteStreams, setRemoteStreams] = useState<RemoteStreamInfo[]>([]);
    const [camEnabled, setCamEnabled] = useState(false);
    const [micEnabled, setMicEnabled] = useState(false);
    const [, setMyProducers] = useState<Record<string, any>>({});

    const hasRemoteScreenShare = remoteStreams.some((s) => s.type === "screen");

    const getDevice = useCallback(() => {
        if (!deviceRef.current || !deviceRef.current.loaded) {
            throw new Error("Mediasoup Device가 로드되지 않았습니다.");
        }
        return deviceRef.current;
    }, []);

    const handleMediaError = (type: StreamType, error: any) => {
        console.error(`${type} 시작 실패:`, error);

        if (error.name === 'NotAllowedError') {
            toast.error(`${type === 'mic' ? '마이크' : '카메라'} 권한이 거부되었습니다.`, {
                description: "권한을 허용해주세요!",
                duration: 6000,
            });
        } else if (error.name === 'NotFoundError') {
            toast.error("장치를 찾을 수 없습니다.", {
                description: "카메라나 마이크가 연결되어 있는지 확인해주세요.",
            });
        } else {
            toast.error(`${type} 시작을 실패했습니다. 다시 시도해주세요.`);
        }
    };

    const createDevice = async (rtpCapabilities: RtpCapabilities) => {
        if (deviceRef.current?.loaded) return deviceRef.current;
        const dev = new MediaDevice();
        await dev.load({ routerRtpCapabilities: rtpCapabilities });
        deviceRef.current = dev;
        return dev;
    };

    const createRecvTransport = async () => {
        if (recvTransportRef.current) return recvTransportRef.current;
        const transportInfo = await new Promise<TransportOptions>((res) => {
            socketRef.current?.emit("create-recv-transport", {}, res);
        });
        const transport = getDevice().createRecvTransport(transportInfo);
        transport.on("connect", ({ dtlsParameters }, callback) => {
            socketRef.current?.emit("recv-transport-connect", { dtlsParameters }, callback);
        });
        recvTransportRef.current = transport;
        return transport;
    };

    const createSendTransport = async () => {
        if (sendTransportRef.current) return sendTransportRef.current;
        const transportInfo = await new Promise<TransportOptions>((res) => {
            socketRef.current?.emit("create-transport", {}, res);
        });
        const transport = getDevice().createSendTransport(transportInfo);

        transport.on("connect", ({ dtlsParameters }, callback) => {
            socketRef.current?.emit("transport-connect", { dtlsParameters });
            callback();
        });

        transport.on("produce", ({ kind, rtpParameters, appData }, callback) => {
            socketRef.current?.emit("transport-produce", { kind, rtpParameters, appData }, ({ id }: { id: string }) => {
                callback({ id });
            });
        });

        sendTransportRef.current = transport;
        return transport;
    };

    const handleNewProducer = useCallback(async (info: ProducerInfo) => {
        const socket = socketRef.current;
        if (!deviceRef.current?.loaded || !socket?.connected) {
            const currentRetry = retryCountsRef.current[info.producerId] || 0;
            if (currentRetry > 10) return;

            if (retryTimersRef.current[info.producerId]) clearTimeout(retryTimersRef.current[info.producerId]);
            retryCountsRef.current[info.producerId] = currentRetry + 1;

            retryTimersRef.current[info.producerId] = setTimeout(() => handleNewProducer(info), 500);
            return;
        }

        if (!socket) return;
        const transport = await createRecvTransport();

        const data = await new Promise<any>((res) => {
            socket.emit("consume", {
                producerId: info.producerId,
                rtpCapabilities: getDevice().rtpCapabilities
            }, res);
        });

        if (!data) return;

        const { id, producerId, kind, rtpParameters } = data;

        const consumer = await transport.consume({ id, producerId, kind, rtpParameters });
        const stream = new MediaStream([consumer.track]);

        if (kind === "video") {
            setRemoteStreams((prev) => [
                ...prev.filter(s => s.producerId !== info.producerId),
                { producerId: info.producerId, socketId: info.socketId, type: info.appData.type, stream }
            ]);
            onRemoteVideoStream?.(stream);
        } else {
            const audioEl = new Audio();
            audioEl.srcObject = stream;
            audioEl.autoplay = true;
            audioEl.setAttribute("data-producer-id", producerId);
            document.body.appendChild(audioEl);
        }

        consumer.on("trackended", () => {
            setRemoteStreams((prev) => prev.filter((s) => s.producerId !== producerId));
        });
    }, [onRemoteVideoStream, getDevice]);

    useEffect(() => {
        handleNewProducerRef.current = handleNewProducer;
    }, [handleNewProducer]);

    const stopMedia = useCallback((type: StreamType) => {
        setStreams((prev) => {
            const currentStream = prev[type];
            if (currentStream) {
                currentStream.getTracks().forEach((t) => t.stop());
            }
            return { ...prev, [type]: null };
        });

        setMyProducers((prev) => {
            const producer = prev[type];
            if (producer) {
                socketRef.current?.emit("close-producer", producer.id);
                producer.close();
            }
            const newProducers = { ...prev };
            delete newProducers[type];
            return newProducers;
        });

        if (type === "camera") setCamEnabled(false);
        if (type === "mic") setMicEnabled(false);
    }, []);

    const startMedia = async (type: StreamType) => {
        try {
            if (type === "camera" && streams.screen) stopMedia("screen");
            if (type === "screen" && streams.camera) stopMedia("camera");

            const stream = type === "camera"
                ? await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 960 },
                        height: { ideal: 540 },
                        frameRate: { ideal: 24 }
                    }
                })
                : await navigator.mediaDevices.getDisplayMedia({ video: true });

            const transport = await createSendTransport();
            const videoTrack = stream.getVideoTracks()[0];
            let producer;

            if (type === "camera") {
                producer = await transport.produce({
                    track: videoTrack,
                    encodings: [
                        { maxBitrate: 150_000 },
                        { maxBitrate: 500_000 },
                        { maxBitrate: 1_200_000 }
                    ],
                    codecOptions: {
                        videoGoogleStartBitrate: 1000
                    },
                    appData: { type }
                });
            } else {
                // screen share는 단일 인코딩이 더 안정적
                producer = await transport.produce({
                    track: videoTrack,
                    appData: { type }
                });
            }


            setMyProducers(prev => ({ ...prev, [type]: producer }));
            setStreams(prev => ({ ...prev, [type]: stream }));
            if (type === "camera") setCamEnabled(true);

            videoTrack.onended = () => {
                socketRef.current?.emit("close-producer", producer.id);
                producer.close();
                setStreams(prev => ({ ...prev, [type]: null }));
                setMyProducers(prev => {
                    const newP = { ...prev };
                    delete newP[type];
                    return newP;
                });
                if (type === "camera") setCamEnabled(false);
            };
        } catch (error) {
            handleMediaError(type, error);
        }
    };

    const toggleCamera = () => (streams.camera ? stopMedia("camera") : startMedia("camera"));
    const toggleScreen = () => (streams.screen ? stopMedia("screen") : startMedia("screen"));

    const toggleMic = async () => {
        if (micEnabled) {
            stopMedia("mic");
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                    }
                });
                const transport = await createSendTransport();
                const producer = await transport.produce({
                    track: stream.getAudioTracks()[0],
                    appData: { type: "mic" }
                });
                setMyProducers(prev => ({ ...prev, mic: producer }));
                setStreams(prev => ({ ...prev, mic: stream }));
                setMicEnabled(true);
            } catch (error) {
                handleMediaError("mic", error);
            }
        }
    };

    useEffect(() => {
        const SERVER_URL = import.meta.env.VITE_MEDIASOUP_SERVER_URL || "http://localhost:4000";
        const socketOptions = SERVER_URL.includes("https")
            ? { path: "/sfu/socket.io" } // Nginx의 /sfu 경로와 socket.io 기본 경로 결합
            : {};
        const sock = io(SERVER_URL, socketOptions);
        socketRef.current = sock;

        sock.on("connect", async () => {
            sock.emit("joinRoom", roomId, async (rtpCapabilities: RtpCapabilities) => {
                await createDevice(rtpCapabilities);
                await createRecvTransport();
                sock.emit("getExistingProducers", (producers: ProducerInfo[]) => {
                    producers.forEach((p) => handleNewProducerRef.current?.(p));
                });
            });
        });

        sock.on("new-producer", (info) => {
            handleNewProducerRef.current?.(info);
        });

        sock.on("producer-closed", (id) => {
            setRemoteStreams((prev) => prev.filter((s) => s.producerId !== id));
            document.querySelectorAll(`audio[data-producer-id="${id}"]`).forEach(el => el.remove());
        });

        return () => {
            sock.disconnect();
            sendTransportRef.current?.close();
            recvTransportRef.current?.close();
            Object.values(retryTimersRef.current).forEach(clearTimeout);
        };
    }, [roomId]);

    useEffect(() => {
        const handleDeviceChange = async () => {
            try {
                await navigator.mediaDevices.enumerateDevices();
                toast.info("장치 변경 감지", {
                    description: "마이크/카메라 장치가 변경되었습니다. 필요 시 설정을 확인하세요.",
                    duration: 4000
                });
            } catch (err) {
                console.error("Device change error:", err);
            }
        };

        navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
        return () => {
            navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
        };
    }, []);

    return {
        streams,
        remoteStreams,
        camEnabled,
        micEnabled,
        hasRemoteScreenShare,
        localVideoRef,
        toggleCamera,
        toggleScreen,
        toggleMic,
    };
};