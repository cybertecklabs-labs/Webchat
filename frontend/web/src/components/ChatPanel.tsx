"use client";

import { useChannelStore } from "@/store/channelStore";
import { useMessageStore } from "@/store/messageStore";
import { useAuthStore } from "@/store/authStore";
import { useState, useEffect, useRef } from "react";
import { Hash, Send } from "lucide-react";
import { formatDate } from "@/lib/utils";
import websocket from "@/services/websocket";
import { LoadingSkeleton } from "./LoadingSkeleton";

export function ChatPanel() {
    const { currentChannel } = useChannelStore();
    const { messages, loading } = useMessageStore();
    const { user } = useAuthStore();
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !currentChannel) return;

        websocket.sendMessage(currentChannel.id, input);
        setInput("");
    };

    const handleTyping = () => {
        if (currentChannel) {
            websocket.sendTyping(currentChannel.id);
        }
    };

    if (!currentChannel) {
        return (
            <div className="flex-1 bg-[#313338] flex items-center justify-center text-gray-400">
                <div className="text-center">
                    <Hash className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <h2 className="text-xl font-bold text-white mb-1">Welcome to WebChat</h2>
                    <p className="text-sm">Select a channel to start chatting</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-[#313338] flex flex-col relative">
            {/* Channel header */}
            <div className="h-12 px-4 flex items-center border-b border-[#1f1f1f]/50 shadow-sm backdrop-blur-md bg-[#313338]/80 z-10">
                <Hash className="w-5 h-5 text-gray-400 mr-2" />
                <span className="font-bold text-white">{currentChannel.name}</span>
                {currentChannel.topic && (
                    <>
                        <div className="w-px h-6 bg-gray-700 mx-3" />
                        <span className="text-sm text-gray-400 truncate">{currentChannel.topic}</span>
                    </>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                {loading ? (
                    <LoadingSkeleton variant="message" />
                ) : (
                    messages.map((message, index) => {
                        const isSameUser = index > 0 && messages[index - 1].user_id === message.user_id;

                        return (
                            <div key={message.id} className={`group flex gap-4 hover:bg-black/5 px-2 py-1 rounded transition-colors ${isSameUser ? 'mt-0' : 'mt-4'}`}>
                                {!isSameUser ? (
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg mt-1">
                                        {message.user_id === user?.id ? 'ME' : 'U'}
                                    </div>
                                ) : (
                                    <div className="w-10 flex-shrink-0" />
                                )}
                                <div className="flex-1">
                                    {!isSameUser && (
                                        <div className="flex items-baseline gap-2">
                                            <span className="font-bold text-cyan-400 hover:underline cursor-pointer">User</span>
                                            <span className="text-[10px] text-gray-500 font-medium">{formatDate(message.created_at)}</span>
                                        </div>
                                    )}
                                    <div className="text-gray-200 text-sm leading-relaxed">{message.content}</div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="p-4">
                <form onSubmit={handleSend} className="relative group">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleTyping}
                        placeholder={`Message #${currentChannel.name}`}
                        className="w-full bg-[#383a40] text-gray-200 px-4 py-3 rounded-xl focus:outline-none border border-transparent focus:border-cyan-500/50 transition-all placeholder:text-gray-500 shadow-inner"
                    />
                    <button
                        type="submit"
                        className="absolute right-2 top-1.5 p-2 text-gray-400 hover:text-cyan-400 transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
