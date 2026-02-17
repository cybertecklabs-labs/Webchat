"use client";

import { Mic, MicOff, Headphones, Settings } from "lucide-react";
import { useState } from "react";

export function VoiceFooter() {
    const [muted, setMuted] = useState(false);
    const [deafened, setDeafened] = useState(false);

    return (
        <div className="h-14 bg-gray-900 border-t border-gray-800 px-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gaming-green flex items-center justify-center text-gray-900 font-semibold text-sm">
                    U
                </div>
                <div>
                    <div className="text-sm font-semibold text-white">Username</div>
                    <div className="text-xs text-gray-400">#0000</div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => setMuted(!muted)}
                    className={`p-2 rounded hover:bg-gray-700 transition-colors ${muted ? "text-red-500" : "text-gray-300"
                        }`}
                    title={muted ? "Unmute" : "Mute"}
                >
                    {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <button
                    onClick={() => setDeafened(!deafened)}
                    className={`p-2 rounded hover:bg-gray-700 transition-colors ${deafened ? "text-red-500" : "text-gray-300"
                        }`}
                    title={deafened ? "Undeafen" : "Deafen"}
                >
                    <Headphones className="w-5 h-5" />
                </button>
                <button
                    className="p-2 rounded hover:bg-gray-700 transition-colors text-gray-300"
                    title="User Settings"
                >
                    <Settings className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
