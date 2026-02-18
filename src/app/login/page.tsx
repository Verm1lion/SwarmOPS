'use client'

import { loginAdmin } from '@/app/actions/auth'
import Link from 'next/link'
import { useActionState, useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'

const SwarmNetwork3D = dynamic(() => import('@/components/login/SwarmNetwork3D'), { ssr: false })

const initialState = {
    error: '',
}

const SYSTEM_LOGS = [
    "INITIALIZING SECURE KERNEL...",
    "VERIFYING BIOMETRIC SIGNATURE...",
    "ESTABLISHING ENCRYPTED UPLINK...",
    "HANDSHAKE PROTOCOL: [SECURE]",
    "SYNCING SWARM NODES...",
    "ACCESS GRANTED."
]

export default function LoginPage() {
    // @ts-ignore
    const [state, formAction, isPending] = useActionState(loginAdmin, initialState)
    const [introComplete, setIntroComplete] = useState(false)
    const [startCamera, setStartCamera] = useState(false)
    const [logs, setLogs] = useState<string[]>([])

    // System Initialization Ritual
    useEffect(() => {
        let delay = 500

        SYSTEM_LOGS.forEach((log, index) => {
            setTimeout(() => {
                setLogs(prev => [...prev, log])

                // Triggers
                if (index === SYSTEM_LOGS.length - 1) {
                    // "ACCESS GRANTED" - Trigger Camera Jump
                    setTimeout(() => {
                        setStartCamera(true)
                    }, 1000)
                }
            }, delay)
            delay += (index === SYSTEM_LOGS.length - 2) ? 1500 : 800 // Extra wait before "ACCESS GRANTED"
        })
    }, [])

    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-slate-950 text-white font-sans">
            {/* 3D Background - Triggers intro completion */}
            <SwarmNetwork3D
                startAnimation={startCamera}
                onIntroComplete={() => setIntroComplete(true)}
            />

            {/* Initialization Overlay */}
            <AnimatePresence>
                {!startCamera && (
                    <motion.div
                        exit={{ opacity: 0, scale: 1.5, filter: 'blur(20px)' }}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    >
                        <div className="font-mono text-xs sm:text-sm text-indigo-400 space-y-2 w-[320px]">
                            {logs.map((log, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`flex items-center gap-2 ${i === SYSTEM_LOGS.length - 1 ? 'text-green-400 font-bold text-base mt-4' : ''}`}
                                >
                                    <span className="opacity-50">{'>'}</span>
                                    {log}
                                    {i === logs.length - 1 && i !== SYSTEM_LOGS.length - 1 && (
                                        <motion.span
                                            animate={{ opacity: [0, 1, 0] }}
                                            transition={{ repeat: Infinity, duration: 0.5 }}
                                            className="w-2 h-4 bg-indigo-500 inline-block ml-1 align-middle"
                                        />
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {introComplete && (
                    <div className="z-20 w-full max-w-[480px] p-6 relative flex flex-col items-center">
                        {/* Title Sequence - Blur to Focus */}
                        <motion.div
                            initial={{ opacity: 0, filter: 'blur(20px)', scale: 1.1 }}
                            animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                            transition={{ duration: 1.2, ease: 'easeOut' }}
                            className="flex flex-col items-center mb-10 text-center"
                        >
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 15 }}
                                className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)] backdrop-blur-md"
                            >
                                <span className="material-symbols-outlined text-5xl text-indigo-400 drop-shadow-[0_0_10px_rgba(129,140,248,0.5)]">hub</span>
                            </motion.div>

                            <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 mb-3 block">
                                Swarm Connection
                            </h1>
                            <p className="text-indigo-200/60 text-sm font-medium tracking-wide">
                                Proje Takip Uygulamasına Hoş geldiniz
                            </p>
                        </motion.div>

                        {/* Card Slide Up */}
                        <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="w-full rounded-3xl p-8 sm:p-10 relative overflow-hidden backdrop-blur-2xl border border-white/5 bg-black/40 shadow-2xl"
                        >
                            {/* Top Glow */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent blur-[2px]"></div>

                            {/* Form */}
                            <form action={formAction} className="flex flex-col gap-6">
                                {state?.error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-200 text-center backdrop-blur-sm"
                                    >
                                        {state.error}
                                    </motion.div>
                                )}

                                {/* Email Input */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 1.2 }}
                                    className="space-y-2"
                                >
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
                                </motion.div>

                                {/* Password Input */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 1.4 }}
                                    className="space-y-2"
                                >
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
                                </motion.div>

                                {/* Sign In Button */}
                                <motion.button
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.6 }}
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
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.8 }}
                                >
                                    <Link href="/join" className="group flex items-center justify-center gap-2 h-12 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-indigo-200/70 text-sm font-semibold mt-2 backdrop-blur-sm">
                                        <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">person_add</span>
                                        <span>Join as Guest</span>
                                    </Link>
                                </motion.div>
                            </form>
                        </motion.div>

                        {/* Footer Links */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2.0 }}
                            className="mt-8 flex justify-center items-center gap-6 text-indigo-300/30 text-[10px] font-bold tracking-widest uppercase"
                        >
                            <a className="hover:text-indigo-300/60 transition-colors" href="#">Privacy</a>
                            <span className="w-1 h-1 rounded-full bg-indigo-500/30"></span>
                            <a className="hover:text-indigo-300/60 transition-colors" href="#">Terms</a>
                            <span className="w-1 h-1 rounded-full bg-indigo-500/30"></span>
                            <a className="hover:text-indigo-300/60 transition-colors" href="#">Help</a>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
