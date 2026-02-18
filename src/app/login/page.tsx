'use client'

import { loginAdmin } from '@/app/actions/auth'
import Link from 'next/link'
import { useActionState } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'

const SwarmNetwork3D = dynamic(() => import('@/components/login/SwarmNetwork3D'), { ssr: false })

const initialState = {
    error: '',
}

export default function LoginPage() {
    // @ts-ignore
    const [state, formAction, isPending] = useActionState(loginAdmin, initialState)

    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-slate-950 text-white font-sans">
            {/* 3D Background */}
            <SwarmNetwork3D />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} // Apple-style ease
                className="z-20 w-full max-w-[480px] p-6 relative"
            >
                {/* Card Container */}
                <div className="w-full rounded-3xl p-8 sm:p-10 relative overflow-hidden backdrop-blur-2xl border border-white/5 bg-black/40 shadow-2xl">

                    {/* Top Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent blur-[2px]"></div>

                    {/* Header */}
                    <div className="flex flex-col items-center mb-10">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                            className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)] backdrop-blur-md"
                        >
                            <span className="material-symbols-outlined text-5xl text-indigo-400 drop-shadow-[0_0_10px_rgba(129,140,248,0.5)]">hub</span>
                        </motion.div>
                        <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 mb-3 text-center">
                            Swarm Connection
                        </h1>
                        <p className="text-indigo-200/60 text-sm font-medium tracking-wide text-center">
                            Proje Takip Uygulamasına Hoş geldiniz
                        </p>
                    </div>

                    {/* Form */}
                    <form action={formAction} className="flex flex-col gap-6">
                        {state?.error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-200 text-center backdrop-blur-sm"
                            >
                                {state.error}
                            </motion.div>
                        )}

                        {/* Email Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-indigo-200/50 uppercase tracking-wider ml-1" htmlFor="email">Email</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-indigo-300/40 text-[20px] transition-colors group-focus-within:text-indigo-400">mail</span>
                                <input
                                    className="w-full rounded-xl bg-white/5 border border-white/5 py-4 pl-12 pr-4 text-white placeholder-indigo-200/20 outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 focus:shadow-[0_0_20px_-5px_rgba(99,102,241,0.2)] transition-all duration-300"
                                    id="email"
                                    name="email"
                                    placeholder="name@swarmtrack.com"
                                    type="email"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-xs font-bold text-indigo-200/50 uppercase tracking-wider" htmlFor="password">Password</label>
                            </div>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-indigo-300/40 text-[20px] transition-colors group-focus-within:text-indigo-400">lock</span>
                                <input
                                    className="w-full rounded-xl bg-white/5 border border-white/5 py-4 pl-12 pr-4 text-white placeholder-indigo-200/20 outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 focus:shadow-[0_0_20px_-5px_rgba(99,102,241,0.2)] transition-all duration-300"
                                    id="password"
                                    name="password"
                                    placeholder="••••••••"
                                    type="password"
                                    required
                                />
                            </div>
                        </div>

                        {/* Sign In Button */}
                        <motion.button
                            whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(79, 70, 229, 0.4)" }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isPending}
                            className="mt-2 w-full h-14 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-[length:200%_auto] animate-[gradient_3s_ease_infinite] text-white font-bold tracking-wide shadow-lg shadow-indigo-900/40 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed border border-white/10"
                        >
                            <span>{isPending ? 'AUTHENTICATING...' : 'ACCESS DASHBOARD'}</span>
                            {!isPending && <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>}
                        </motion.button>

                        {/* Guest Login Link */}
                        <Link href="/join" className="group flex items-center justify-center gap-2 h-12 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-indigo-200/70 text-sm font-semibold mt-2 backdrop-blur-sm">
                            <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">person_add</span>
                            <span>Join as Guest</span>
                        </Link>
                    </form>
                </div>

                {/* Footer Links */}
                <div className="mt-8 flex justify-center items-center gap-6 text-indigo-300/30 text-[10px] font-bold tracking-widest uppercase">
                    <a className="hover:text-indigo-300/60 transition-colors" href="#">Privacy</a>
                    <span className="w-1 h-1 rounded-full bg-indigo-500/30"></span>
                    <a className="hover:text-indigo-300/60 transition-colors" href="#">Terms</a>
                    <span className="w-1 h-1 rounded-full bg-indigo-500/30"></span>
                    <a className="hover:text-indigo-300/60 transition-colors" href="#">Help</a>
                </div>
            </motion.div>
        </div>
    )
}
