"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [validationError, setValidationError] = useState('');
    const { register, loading, error } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError('');

        if (password !== confirmPassword) {
            setValidationError('Passwords do not match');
            return;
        }
        if (password.length < 8) {
            setValidationError('Password must be at least 8 characters');
            return;
        }

        try {
            await register(username, email, password);
            router.push('/login');
        } catch (err) {
            // error handled by useAuth
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Animated Background */}
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

            <motion.div
                className="relative z-10 w-full max-w-md"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="flex flex-col items-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-20 h-20 mb-4 relative"
                    >
                        <img src="/logo.png" alt="WebChat Logo" className="w-full h-full object-contain relative z-10" />
                        <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full" />
                    </motion.div>
                    <h1 className="text-4xl font-black text-white tracking-tighter italic">
                        WebChat
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Join the gaming revolution</p>
                </div>

                <motion.div
                    className="backdrop-blur-xl bg-gray-900/50 rounded-3xl p-8 border border-cyan-500/20 shadow-2xl"
                    whileHover={{ borderColor: 'rgba(0, 212, 170, 0.4)' }}
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {(error || validationError) && (
                            <motion.div
                                className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                            >
                                {error || validationError}
                            </motion.div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 bg-black/50 border border-gray-800 rounded-xl text-white focus:border-cyan-500 focus:outline-none transition-colors"
                                placeholder="GamerTag"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-black/50 border border-gray-800 rounded-xl text-white focus:border-cyan-500 focus:outline-none transition-colors"
                                placeholder="gamer@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-black/50 border border-gray-800 rounded-xl text-white focus:border-cyan-500 focus:outline-none transition-colors"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-black/50 border border-gray-800 rounded-xl text-white focus:border-cyan-500 focus:outline-none transition-colors"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <motion.button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold text-white shadow-lg disabled:opacity-50"
                            whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(0, 212, 170, 0.4)' }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {loading ? 'Creating account...' : 'Register'}
                        </motion.button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-500 text-sm">
                            Already have an account?{' '}
                            <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                                Login
                            </Link>
                        </p>
                    </div>
                </motion.div>

                <motion.div
                    className="mt-6 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <Link href="/" className="text-gray-600 hover:text-gray-400 text-sm">
                        ← Back to landing page
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
}
