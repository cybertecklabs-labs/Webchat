"use client";

import { useChannelStore } from "@/store/channelStore";
import { useServerStore } from "@/store/serverStore";
import { useEffect } from "react";
import { Hash, Volume2 } from "lucide-react";

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
        <div className="w-60 bg-gray-800 flex flex-col border-r border-gray-900">
            {/* Server header */}
            <div className="h-12 px-4 flex items-center border-b border-gray-900 font-semibold text-white shadow-sm">
                {currentServer.name}
            </div>

            {/* Channels list */}
            <div className="flex-1 overflow-y-auto p-2">
                {/* Text channels */}
                {textChannels.length > 0 && (
                    <div className="mb-4">
                        <div className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase">
                            Text Channels
                        </div>
                        {textChannels.map((channel) => (
                            <div
                                key={channel.id}
                                onClick={() => setCurrentChannel(channel)}
                                className={`px-2 py-1.5 rounded flex items-center gap-2 cursor-pointer ${currentChannel?.id === channel.id
                                        ? "bg-gray-700 text-white"
                                        : "text-gray-400 hover:bg-gray-700/50 hover:text-gray-200"
                                    }`}
                            >
                                <Hash className="w-4 h-4" />
                                <span className="text-sm">{channel.name}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Voice channels */}
                {voiceChannels.length > 0 && (
                    <div>
                        <div className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase">
                            Voice Channels
                        </div>
                        {voiceChannels.map((channel) => (
                            <div
                                key={channel.id}
                                className="px-2 py-1.5 rounded flex items-center gap-2 cursor-pointer text-gray-400 hover:bg-gray-700/50 hover:text-gray-200"
                            >
                                <Volume2 className="w-4 h-4" />
                                <span className="text-sm">{channel.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
