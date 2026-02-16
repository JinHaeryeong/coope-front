import { createContext } from "react";
import type { Client } from "@stomp/stompjs";

export interface SocketContextType {
    stompClient: Client | null;
    isConnected: boolean;
}

export const SocketContext = createContext<SocketContextType | null>(null);
