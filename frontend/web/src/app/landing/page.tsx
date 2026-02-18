"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MessageSquare, Shield, Zap, Users } from "lucide-react";

export default function LandingPage() {
    const router = useRouter();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const [userCount, setUserCount] = useState(1234);
    useEffect(() => {
        const interval = setInterval(() => {
            setUserCount(prev => Math.max(1200, prev + Math.floor(Math.random() * 10) - 3));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div ref={containerRef} className="relative min-h-screen bg-black text-white overflow-hidden font-sans">
            {/* SEO Metadata is handled via layout.tsx or Head in Next.js. 
          For App Router, we should use generateMetadata, but since this is a client component, 
          we'll assume the parent layout or a separate SEO component handles it.
          Alternatively, we can use a custom SEO component. */}

            {/* Background Gradients */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0a0a0a_1px,transparent_1px),linear-gradient(to_bottom,#0a0a0a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30" />
                <motion.div
                    className="absolute inset-0 opacity-20"
                    animate={{
                        backgroundImage: [
                            'radial-gradient(circle at 20% 50%, #00d4aa, transparent 50%)',
                            'radial-gradient(circle at 80% 50%, #7b2ff7, transparent 50%)',
                            'radial-gradient(circle at 50% 20%, #00a3ff, transparent 50%)',
                        ],
                    }}
                    transition={{ duration: 10, repeat: Infinity }}
                />
            </div>

            <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full relative z-10">
                <div className="flex items-center gap-2 group cursor-pointer">
                    <div className="relative w-10 h-10">
                        <img src="/logo.png" alt="WebChat Logo" className="w-full h-full object-contain" />
                        <div className="absolute inset-0 bg-cyan-400/20 blur-lg group-hover:bg-cyan-400/40 transition-all rounded-full" />
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-white group-hover:text-cyan-400 transition-colors">
                        WebChat
                    </span>
                </div>
                <div className="flex gap-4">
                    <Link href="/login">
                        <Button variant="ghost" className="text-white hover:text-cyan-400">
                            Login
                        </Button>
                    </Link>
                    <Link href="/register">
                        <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </nav>

            <main className="relative z-10">
                <section className="flex flex-col items-center justify-center text-center py-32 px-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent"
                    >
                        Gaming Chat,
                        <br />
                        Self-Hosted
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl md:text-2xl text-gray-400 max-w-3xl mb-12"
                    >
                        Real-time messaging, voice, and presence for your gaming community – fully under your control.
                        No corporate surveillance, no data mining.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex gap-4 flex-wrap justify-center"
                    >
                        <Link href="/register">
                            <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-lg px-8 py-7 rounded-2xl shadow-[0_0_40px_rgba(0,212,170,0.3)]">
                                Launch App
                            </Button>
                        </Link>
                        <Link href="https://github.com/cybertecklabs/WebChat" target="_blank">
                            <Button size="lg" variant="outline" className="border-gray-800 bg-gray-900/50 text-white text-lg px-8 py-7 rounded-2xl backdrop-blur-xl">
                                View on GitHub
                            </Button>
                        </Link>
                    </motion.div>

                    <div className="mt-16 text-cyan-400/60 font-mono text-sm">
                        ONLINE USERS: {userCount.toLocaleString()}
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-4 py-24">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard
                            icon={<Shield className="w-10 h-10" />}
                            title="100% Self-Hosted"
                            description="Your data stays on your servers. Complete control, zero vendor lock-in."
                            color="cyan"
                        />
                        <FeatureCard
                            icon={<Zap className="w-10 h-10" />}
                            title="Blazing Fast"
                            description="Built with Rust for sub-100ms latency. WebSocket real-time messaging."
                            color="blue"
                        />
                        <FeatureCard
                            icon={<Users className="w-10 h-10" />}
                            title="Gaming Optimized"
                            description="Voice chat, presence system, and rich gaming integrations built-in."
                            color="purple"
                        />
                        <FeatureCard
                            icon={<MessageSquare className="w-10 h-10" />}
                            title="Open Source"
                            description="MIT licensed. Fully auditable code. Community-driven development."
                            color="cyan"
                        />
                    </div>
                </section>
            </main>

            <footer className="relative z-10 border-t border-gray-900 py-12 text-center text-gray-500">
                <p>© 2026 WebChat by Cyberteck Labs</p>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description, color }: any) {
    const colors: any = {
        cyan: "from-cyan-400 to-blue-500",
        blue: "from-blue-500 to-purple-600",
        purple: "from-purple-600 to-pink-500"
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-gray-900/40 backdrop-blur-xl p-8 rounded-3xl border border-gray-800 hover:border-cyan-500/50 transition-colors"
        >
            <div className={`w-16 h-16 bg-gradient-to-br ${colors[color]} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                {React.cloneElement(icon, { className: "w-8 h-8 text-white" })}
            </div>
            <h3 className="text-2xl font-bold mb-3">{title}</h3>
            <p className="text-gray-400 leading-relaxed">{description}</p>
        </motion.div>
    );
}
