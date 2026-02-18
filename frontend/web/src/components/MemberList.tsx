"use client";

import { motion } from "framer-motion";

export function MemberList() {
    // Mock data for now
    const onlineMembers = ["User1", "User2", "User3"];
    const offlineMembers = ["User4", "User5"];

    return (
        <div className="w-60 bg-[#2b2d31] border-l border-gray-900/50 p-4 overflow-y-auto custom-scrollbar">
            <div className="mb-6">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-2">
                    Online — {onlineMembers.length}
                </div>
                <div className="space-y-0.5">
                    {onlineMembers.map((member, idx) => (
                        <motion.div
                            key={member}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ scale: 1.02, x: 2 }}
                            className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-gray-700/40 cursor-pointer group transition-colors"
                        >
                            <div className="relative">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                                    {member[0]}
                                </div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#2b2d31]" />
                            </div>
                            <span className="text-sm font-medium text-gray-400 group-hover:text-gray-200">{member}</span>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div>
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-2">
                    Offline — {offlineMembers.length}
                </div>
                <div className="space-y-0.5">
                    {offlineMembers.map((member, idx) => (
                        <motion.div
                            key={member}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: (onlineMembers.length + idx) * 0.05 }}
                            whileHover={{ scale: 1.02, x: 2 }}
                            className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-gray-700/40 cursor-pointer group grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all"
                        >
                            <div className="relative">
                                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-gray-300 font-bold text-xs">
                                    {member[0]}
                                </div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-gray-500 rounded-full border-2 border-[#2b2d31]" />
                            </div>
                            <span className="text-sm font-medium text-gray-500 group-hover:text-gray-400">{member}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
