"use client";

import { useChannelStore } from "@/store/channelStore";
import { useAuthStore } from "@/store/authStore";
import { useState, useEffect, useRef } from "react";
import { Hash, Send } from "lucide-react";
import { formatDate } from "@/lib/utils";

export function ChatPanel() {
    const { currentChannel, messages, sendMessage, addMessage } = useChannelStore();
    const { token } = useAuthStore();
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const wsRef = useRef<WebSocket | null>(null);

    // WebSocket connection
    useEffect(() => {
        if (!token) return;

        const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/ws";
        const ws = new WebSocket(`${WS_URL}?token=${token}`);

        ws.onopen = () => {
            console.log("WebSocket connected");
        };

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                addMessage(message);
            } catch (error) {
                console.error("Failed to parse message:", error);
            }
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        ws.onclose = () => {
            console.log("WebSocket disconnected");
        };

        wsRef.current = ws;

        return () => {
            ws.close();
        };
    }, [token, addMessage]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !currentChannel) return;

        await sendMessage(currentChannel.id, input);
        setInput("");
    };

    if (!currentChannel) {
        return (
            <div className="flex-1 bg-gray-700 flex items-center justify-center text-gray-400">
                Select a channel to start chatting
            </div>
        );
    }

    return (
        <div className="flex-1 bg-gray-700 flex flex-col">
            {/* Channel header */}
            <div className="h-12 px-4 flex items-center border-b border-gray-800 shadow-sm">
                <Hash className="w-5 h-5 text-gray-400 mr-2" />
                <span className="font-semibold text-white">{currentChannel.name}</span>
                {currentChannel.topic && (
                    <>
                        <div className="w-px h-6 bg-gray-600 mx-3" />
                        <span className="text-sm text-gray-400">{currentChannel.topic}</span>
                    </>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div key={message.id} className="flex gap-3 hover:bg-gray-800/50 p-2 rounded">
                        <div className="w-10 h-10 rounded-full bg-gaming-green flex items-center justify-center text-gray-900 font-semibold flex-shrink-0">
                            U
                        </div>
                        <div className="flex-1">
                            <div className="flex items-baseline gap-2">
                                <span className="font-semibold text-white">User</span>
                                <span className="text-xs text-gray-400">{formatDate(message.created_at)}</span>
                            </div>
                            <div className="text-gray-200 text-sm mt-1">{message.content}</div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="p-4">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={`Message #${currentChannel.name}`}
                        className="flex-1 bg-gray-600 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gaming-green"
                    />
                    <button
                        type="submit"
                        className="bg-gaming-green text-gray-900 p-3 rounded-lg hover:bg-gaming-green/80 transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
