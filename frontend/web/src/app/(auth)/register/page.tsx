"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        setLoading(true);

        try {
            await authApi("/register", {
                method: "POST",
                body: JSON.stringify({ username, email, password }),
            });

            router.push("/login");
        } catch (err: any) {
            setError(err.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-12 h-12 bg-gaming-green rounded-lg flex items-center justify-center">
                            <MessageSquare className="w-8 h-8 text-gray-900" />
                        </div>
                        <span className="text-3xl font-bold text-gaming-green">WebChat</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Create an account</h1>
                    <p className="text-gray-400">Join the gaming community today!</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-xl">
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-gray-900 text-white rounded focus:outline-none focus:ring-2 focus:ring-gaming-green"
                            placeholder="gamer123"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-gray-900 text-white rounded focus:outline-none focus:ring-2 focus:ring-gaming-green"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-gray-900 text-white rounded focus:outline-none focus:ring-2 focus:ring-gaming-green"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-gray-900 text-white rounded focus:outline-none focus:ring-2 focus:ring-gaming-green"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gaming-green text-gray-900 font-semibold py-3 rounded hover:bg-gaming-green/80 transition-colors disabled:opacity-50"
                    >
                        {loading ? "Creating account..." : "Register"}
                    </button>

                    <p className="mt-4 text-sm text-gray-400 text-center">
                        Already have an account?{" "}
                        <Link href="/login" className="text-gaming-green hover:underline">
                            Login
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
