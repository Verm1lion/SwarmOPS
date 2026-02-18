'use client'

import { loginAdmin } from '@/app/actions/auth'
import Link from 'next/link'
import { useActionState } from 'react'

const initialState = {
    error: '',
}

export default function LoginPage() {
    // @ts-ignore
    const [state, formAction, isPending] = useActionState(loginAdmin, initialState)

    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-mesh-gradient bg-[length:200%_200%] animate-[gradient_15s_ease_infinite] overflow-hidden bg-stitch-bg-dark text-white font-sans">
            {/* Background Decorative Shapes */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-stitch-blue/20 blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none"></div>

            <div className="z-10 w-full max-w-[480px] p-6">
                <div className="glass-card w-full rounded-2xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
                    {/* Inner Top Shine */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                    {/* Header */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="mb-6 p-3 rounded-xl bg-gradient-to-br from-white/10 to-transparent border border-white/5 shadow-inner">
                            <span className="material-symbols-outlined text-4xl text-white">hub</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome Back</h1>
                        <p className="text-white/50 text-sm font-medium">Enter the hive to track your swarm.</p>
                    </div>

                    {/* Form */}
                    <form action={formAction} className="flex flex-col gap-5">
                        {state?.error && (
                            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-200 text-center">
                                {state.error}
                            </div>
                        )}

                        {/* Email Input */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-white/80 ml-1" htmlFor="email">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-white/40 text-[20px] group-focus-within:text-stitch-blue transition-colors">mail</span>
                                </div>
                                <input
                                    className="glass-input w-full rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-white/20 outline-none focus:ring-0"
                                    id="email"
                                    name="email"
                                    placeholder="name@swarmtrack.com"
                                    type="email"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-medium text-white/80" htmlFor="password">Password</label>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-white/40 text-[20px] group-focus-within:text-stitch-blue transition-colors">lock</span>
                                </div>
                                <input
                                    className="glass-input w-full rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-white/20 outline-none focus:ring-0"
                                    id="password"
                                    name="password"
                                    placeholder="••••••••"
                                    type="password"
                                    required
                                />
                            </div>
                        </div>

                        {/* Sign In Button */}
                        <button
                            type="submit"
                            disabled={isPending}
                            className="mt-4 w-full h-12 rounded-xl bg-gradient-to-r from-stitch-blue to-[#5b5bf0] hover:to-[#6c6cf5] text-white font-semibold shadow-lg shadow-stitch-blue/25 hover:shadow-stitch-blue/40 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <span>{isPending ? 'Signing In...' : 'Sign In'}</span>
                            {!isPending && <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>}
                        </button>

                        {/* Divider - Removed */}

                        {/* Guest Login Link */}
                        <Link href="/join" className="flex items-center justify-center gap-2 h-11 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white/90 text-sm font-medium mt-2">
                            <span className="material-symbols-outlined text-[20px]">person_add</span>
                            <span>Join as Guest (with Code)</span>
                        </Link>
                    </form>

                    {/* Footer - Removed "Create an account" */}

                </div>

                {/* Bottom decorative elements */}
                <div className="mt-6 flex justify-center items-center gap-6 text-white/20 text-xs">
                    <a className="hover:text-white/40 transition-colors" href="#">Privacy</a>
                    <span className="w-1 h-1 rounded-full bg-white/10"></span>
                    <a className="hover:text-white/40 transition-colors" href="#">Terms</a>
                    <span className="w-1 h-1 rounded-full bg-white/10"></span>
                    <a className="hover:text-white/40 transition-colors" href="#">Help</a>
                </div>
            </div>
        </div>
    )
}
