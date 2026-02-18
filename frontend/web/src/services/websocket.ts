type MessageCallback = (msg: any) => void;

class WebSocketManager {
    private ws: WebSocket | null = null;
    private messageCallbacks: MessageCallback[] = [];
    private token: string | null = null;

    connect(token: string) {
        this.token = token;
        const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/ws";
        this.ws = new WebSocket(`${WS_URL}?token=${token}`);

        this.ws.onopen = () => {
            console.log("WebSocket connected");
        };

        this.ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                this.messageCallbacks.forEach(callback => callback(message));
            } catch (error) {
                console.error("Failed to parse message:", error);
            }
        };

        this.ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        this.ws.onclose = () => {
            console.log("WebSocket disconnected");
        };
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    onMessage(callback: MessageCallback) {
        this.messageCallbacks.push(callback);
    }

    joinChannel(channelId: string) {
        this.send({ type: "join_channel", channel_id: channelId });
    }

    leaveChannel(channelId: string) {
        this.send({ type: "leave_channel", channel_id: channelId });
    }

    sendMessage(channelId: string, content: string) {
        this.send({ type: "send_message", channel_id: channelId, content });
    }

    sendTyping(channelId: string) {
        this.send({ type: "typing", channel_id: channelId });
    }

    private send(data: any) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            console.warn("WebSocket not connected");
        }
    }
}

const websocket = new WebSocketManager();
export default websocket;
