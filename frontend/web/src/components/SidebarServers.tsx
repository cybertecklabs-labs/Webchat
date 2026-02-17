"use client";

import { useServerStore } from "@/store/serverStore";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export function SidebarServers() {
    const { servers, fetchServers, setCurrentServer, currentServer } = useServerStore();
    const { token } = useAuthStore();

    useEffect(() => {
        if (token) {
            fetchServers();
        }
    }, [token, fetchServers]);

    return (
        <div className="w-16 bg-gray-900 flex flex-col items-center py-4 space-y-2 border-r border-gray-800">
            {/* Home button */}
            <div className="w-12 h-12 bg-discord-blurple rounded-full flex items-center justify-center cursor-pointer hover:rounded-lg transition-all">
                <span className="text-white font-bold text-xl">W</span>
            </div>

            <div className="w-8 h-0.5 bg-gray-700 rounded-full" />

            {/* Server list */}
            {servers.map((server) => (
                <div
                    key={server.id}
                    onClick={() => setCurrentServer(server)}
                    className={`w-12 h-12 bg-gray-700 rounded-full cursor-pointer hover:rounded-lg transition-all flex items-center justify-center ${currentServer?.id === server.id ? "rounded-lg ring-2 ring-gaming-green" : ""
                        }`}
                    title={server.name}
                >
                    <span className="text-white font-semibold text-sm">
                        {server.name.substring(0, 2).toUpperCase()}
                    </span>
                </div>
            ))}

            {/* Add server button */}
            <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-gaming-green hover:rounded-lg transition-all group">
                <span className="text-gaming-green group-hover:text-gray-900 text-2xl font-light">+</span>
            </div>
        </div>
    );
}
