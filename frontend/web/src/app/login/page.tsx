"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function Login() {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const setAuth = useAuthStore((state) => state.setAuth);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("http://localhost:3001/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                const data = await res.json();
                setAuth(data.user, data.access_token);
                router.push("/chat");
            } else {
                setError("Invalid credentials");
            }
        } catch (err) {
            setError("Network error");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950">
            <form onSubmit={handleSubmit} className="glass-panel w-full max-w-md space-y-4 p-8 rounded-2xl">
                <h2 className="text-2xl font-bold text-center text-white mb-6">Login to WebChat</h2>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <input
                    type="email"
                    placeholder="Email"
                    className="w-full bg-slate-900 border border-slate-800 p-3 rounded-lg text-white"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full bg-slate-900 border border-slate-800 p-3 rounded-lg text-white"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                />
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors">
                    Login
                </button>
                <p className="text-center text-gray-400 text-sm">
                    Don't have an account? <a href="/register" className="text-indigo-400 hover:underline">Register</a>
                </p>
            </form>
        </div>
    );
}
