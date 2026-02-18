"use client";

import { useChannelStore } from "@/store/channelStore";
import { useServerStore } from "@/store/serverStore";
import { useEffect } from "react";
import { Hash, Volume2 } from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

export function SidebarChannels() {
    const { currentServer } = useServerStore();
    const { channels, fetchChannels, setCurrentChannel, currentChannel } = useChannelStore();

    useEffect(() => {
        if (currentServer) {
            fetchChannels(currentServer.id);
        }
    }, [currentServer, fetchChannels]);

    if (!currentServer) {
        return (
            <div className="w-60 bg-gray-800 flex items-center justify-center text-gray-400">
                Select a server
            </div>
        );
    }

    const textChannels = channels.filter((c) => c.channel_type === "text");
    const voiceChannels = channels.filter((c) => c.channel_type === "voice");

    return (
        <div className="w-60 bg-gray-800 flex flex-col border-r border-gray-900/50">
            {/* Server header */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-12 px-4 flex items-center border-b border-gray-900 font-bold text-white shadow-sm hover:bg-gray-700/30 cursor-pointer transition-colors"
            >
                <span className="truncate">{currentServer.name}</span>
            </motion.div>

            {/* Channels list */}
            <div className="flex-1 overflow-y-auto p-2 space-y-4 custom-scrollbar">
                {/* Text channels */}
                <AnimatePresence>
                    {textChannels.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-0.5"
                        >
                            <div className="px-2 py-1 text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between group">
                                <span>Text Channels</span>
                                <span className="opacity-0 group-hover:opacity-100 cursor-pointer text-gray-400 hover:text-white transition-opacity">+</span>
                            </div>
                            {textChannels.map((channel) => (
                                <motion.div
                                    key={channel.id}
                                    whileHover={{ x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setCurrentChannel(channel)}
                                    className={`group px-2 py-1.5 rounded-md flex items-center gap-2 cursor-pointer transition-colors ${currentChannel?.id === channel.id
                                            ? "bg-gray-700/80 text-white"
                                            : "text-gray-400 hover:bg-gray-700/40 hover:text-gray-200"
                                        }`}
                                >
                                    <Hash className={`w-4 h-4 ${currentChannel?.id === channel.id ? "text-white" : "text-gray-500"}`} />
                                    <span className="text-sm font-medium">{channel.name}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* Voice channels */}
                    {voiceChannels.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="space-y-0.5"
                        >
                            <div className="px-2 py-1 text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between group">
                                <span>Voice Channels</span>
                                <span className="opacity-0 group-hover:opacity-100 cursor-pointer text-gray-400 hover:text-white transition-opacity">+</span>
                            </div>
                            {voiceChannels.map((channel) => (
                                <motion.div
                                    key={channel.id}
                                    whileHover={{ x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="px-2 py-1.5 rounded-md flex items-center gap-2 cursor-pointer text-gray-400 hover:bg-gray-700/40 hover:text-gray-200 group"
                                >
                                    <Volume2 className="w-4 h-4 text-gray-500 group-hover:text-gray-200" />
                                    <span className="text-sm font-medium">{channel.name}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
