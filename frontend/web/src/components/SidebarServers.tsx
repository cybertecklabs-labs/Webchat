"use client";

import { useServerStore } from "@/store/serverStore";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

import { motion } from "framer-motion";

export function SidebarServers() {
    const { servers, fetchServers, setCurrentServer, currentServer } = useServerStore();
    const { token } = useAuthStore();

    useEffect(() => {
        if (token) {
            fetchServers();
        }
    }, [token, fetchServers]);

    return (
        <div className="w-16 bg-gray-900 flex flex-col items-center py-4 space-y-2 border-r border-gray-800 h-full overflow-y-auto custom-scrollbar">
            {/* Home button */}
            <motion.div
                whileHover={{ borderRadius: "12px", scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 bg-gray-900 overflow-hidden flex items-center justify-center cursor-pointer transition-all duration-200"
            >
                <img src="/logo.png" alt="WebChat" className="w-full h-full object-contain" />
            </motion.div>

            <div className="w-8 h-0.5 bg-gray-700/50 rounded-full my-1" />

            {/* Server list */}
            {servers.map((server) => (
                <div key={server.id} className="relative group">
                    <motion.div
                        layoutId={`active-indicator-${server.id}`}
                        className={`absolute -left-4 w-1 bg-white rounded-r-full transition-all duration-200 ${currentServer?.id === server.id ? "h-10 top-1" : "h-2 top-5 opacity-0 group-hover:opacity-100"
                            }`}
                    />
                    <motion.div
                        whileHover={{ borderRadius: "12px", scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentServer(server)}
                        className={`w-12 h-12 bg-gray-700 cursor-pointer flex items-center justify-center shadow-lg transition-all duration-200 ${currentServer?.id === server.id
                            ? "rounded-[12px] bg-gaming-green text-gray-900"
                            : "rounded-[24px] text-white hover:bg-gaming-green hover:text-gray-900"
                            }`}
                        title={server.name}
                    >
                        <span className="font-bold text-xs">
                            {server.name.substring(0, 2).toUpperCase()}
                        </span>
                    </motion.div>
                </div>
            ))}

            {/* Add server button */}
            <motion.div
                whileHover={{ borderRadius: "12px", scale: 1.1, backgroundColor: "#00d4aa" }}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 bg-gray-700 rounded-[24px] flex items-center justify-center cursor-pointer transition-all duration-200 group"
            >
                <span className="text-gaming-green group-hover:text-gray-900 text-2xl font-light">+</span>
            </motion.div>
        </div>
    );
}
