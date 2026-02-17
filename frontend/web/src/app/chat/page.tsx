"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function Chat() {
    const { user, token } = useAuthStore();
    const router = useRouter();
    const [messages, setMessages] = useState<string[]>([]);
    const [input, setInput] = useState("");
    const [ws, setWs] = useState<WebSocket | null>(null);

    useEffect(() => {
        if (!token) {
            router.push("/login");
            return;
        }

        const socket = new WebSocket("ws://localhost:3003/ws");
        socket.onmessage = (event) => {
            setMessages((prev) => [...prev, event.data]);
        };
        setWs(socket);

        return () => socket.close();
    }, [token, router]);

    const sendMessage = () => {
        if (ws && input) {
            ws.send(input);
            setInput("");
        }
    };

    return (
        <div className="flex h-screen bg-slate-950 font-sans text-white">
            {/* Sidebar Placeholder */}
            <div className="w-64 bg-slate-900 flex flex-col border-r border-slate-800">
                <div className="p-4 border-b border-slate-800 font-bold">Servers</div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    <div className="bg-slate-800 p-3 rounded cursor-pointer">Global Chat</div>
                </div>
                <div className="p-4 bg-slate-800/50 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center font-bold">
                        {user?.username[0].toUpperCase()}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <div className="font-bold truncate">{user?.username}</div>
                        <div className="text-xs text-gray-400 truncate tracking-tighter">Online</div>
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50 backdrop-blur-sm">
                    <div className="font-bold text-lg"># global-chat</div>
                    <div className="text-xs text-gray-400">WebChat v0.1.0-alpha</div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map((msg, i) => (
                        <div key={i} className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 max-w-2xl">
                            {msg}
                        </div>
                    ))}
                    {messages.length === 0 && (
                        <div className="text-center text-gray-500 mt-20">
                            Welcome to the beginning of the #global-chat channel!
                        </div>
                    )}
                </div>

                <div className="p-6">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Message #global-chat"
                            className="w-full bg-slate-900 border border-slate-800 p-4 pl-6 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
