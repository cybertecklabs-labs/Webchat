"use client";

import { motion } from "framer-motion";

export function LoadingSkeleton({ variant = "message" }: { variant?: "message" | "channel" | "member" }) {
    if (variant === "channel") {
        return (
            <div className="space-y-2 p-2">
                {[1, 2, 3, 4, 5].map((i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0.3 }}
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                        className="h-8 bg-gray-700/50 rounded-md w-full"
                    />
                ))}
            </div>
        );
    }

    if (variant === "member") {
        return (
            <div className="space-y-3 p-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                        <motion.div
                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-8 h-8 rounded-full bg-gray-700/50"
                        />
                        <motion.div
                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="h-4 bg-gray-700/50 rounded-md w-24"
                        />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4 p-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                    <motion.div
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-10 h-10 rounded-full bg-gray-700/50 shrink-0"
                    />
                    <div className="space-y-2 w-full">
                        <motion.div
                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="h-4 bg-gray-700/50 rounded-md w-1/4"
                        />
                        <motion.div
                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="h-4 bg-gray-700/50 rounded-md w-3/4"
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
