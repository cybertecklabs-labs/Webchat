import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MessageSquare, Shield, Zap, Users } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
            {/* Navigation */}
            <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gaming-green rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-gray-900" />
                    </div>
                    <span className="text-2xl font-bold text-gaming-green">WebChat</span>
                </div>
                <div className="flex gap-4">
                    <Link href="/login">
                        <Button variant="ghost" className="text-white hover:text-gaming-green">
                            Login
                        </Button>
                    </Link>
                    <Link href="/register">
                        <Button className="bg-gaming-green text-gray-900 hover:bg-gaming-green/80">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="flex flex-col items-center justify-center text-center py-20 px-4">
                <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gaming-green via-twitch-purple to-discord-blurple bg-clip-text text-transparent">
                    Gaming Chat,
                    <br />
                    Self-Hosted
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mb-8">
                    Real-time messaging, voice, and presence for your gaming community – fully under your control.
                    No corporate surveillance, no data mining, just pure communication.
                </p>
                <div className="flex gap-4 flex-wrap justify-center">
                    <Link href="/register">
                        <Button size="lg" className="bg-gaming-green text-gray-900 hover:bg-gaming-green/80 text-lg px-8 py-6">
                            Launch App
                        </Button>
                    </Link>
                    <Link href="https://github.com/cybertecklabs/WebChat" target="_blank">
                        <Button size="lg" variant="outline" className="border-gray-600 text-white hover:bg-gray-800 text-lg px-8 py-6">
                            View on GitHub
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Features Grid */}
            <section className="max-w-7xl mx-auto px-4 py-20">
                <h2 className="text-4xl font-bold text-center mb-12">Why WebChat?</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 hover:border-gaming-green transition-colors">
                        <Shield className="w-12 h-12 text-gaming-green mb-4" />
                        <h3 className="text-xl font-semibold mb-2">100% Self-Hosted</h3>
                        <p className="text-gray-400">Your data stays on your servers. Complete control, zero vendor lock-in.</p>
                    </div>
                    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 hover:border-twitch-purple transition-colors">
                        <Zap className="w-12 h-12 text-twitch-purple mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Blazing Fast</h3>
                        <p className="text-gray-400">Built with Rust for sub-100ms latency. WebSocket real-time messaging.</p>
                    </div>
                    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 hover:border-discord-blurple transition-colors">
                        <Users className="w-12 h-12 text-discord-blurple mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Gaming Optimized</h3>
                        <p className="text-gray-400">Voice chat, presence system, and rich gaming integrations built-in.</p>
                    </div>
                    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 hover:border-gaming-green transition-colors">
                        <MessageSquare className="w-12 h-12 text-gaming-green mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Open Source</h3>
                        <p className="text-gray-400">MIT licensed. Fully auditable code. Community-driven development.</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="max-w-4xl mx-auto px-4 py-20 text-center">
                <h2 className="text-4xl font-bold mb-6">Ready to take control?</h2>
                <p className="text-xl text-gray-300 mb-8">
                    Deploy WebChat in 5 minutes with Docker. No credit card required.
                </p>
                <Link href="/register">
                    <Button size="lg" className="bg-gaming-green text-gray-900 hover:bg-gaming-green/80 text-lg px-12 py-6">
                        Get Started Free
                    </Button>
                </Link>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-800 py-8 text-center text-gray-400">
                <p>Made with ❤️ by Cyberteck Labs</p>
                <p className="mt-2 text-sm">
                    <Link href="https://github.com/cybertecklabs/WebChat" className="hover:text-gaming-green">
                        GitHub
                    </Link>
                    {" • "}
                    <Link href="/docs" className="hover:text-gaming-green">
                        Documentation
                    </Link>
                </p>
            </footer>
        </div>
    );
}
