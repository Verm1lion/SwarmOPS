import { joinProject } from '@/app/actions/auth'
import Link from 'next/link'

export default function JoinPage() {
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
                            <span className="material-symbols-outlined text-4xl text-white">person_add</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Guest Access</h1>
                        <p className="text-white/50 text-sm font-medium">Enter your name and the magic code.</p>
                    </div>

                    <form action={async (formData) => {
                        'use server'
                        await joinProject(formData)
                    }} className="flex flex-col gap-5">
                        {/* Name Input */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-white/80 ml-1" htmlFor="name">Full Name</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-white/40 text-[20px] group-focus-within:text-stitch-blue transition-colors">badge</span>
                                </div>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    className="glass-input w-full rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-white/20 outline-none focus:ring-0"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        {/* Join Code Input */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-white/80 ml-1" htmlFor="accessCode">Access Code</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-white/40 text-[20px] group-focus-within:text-stitch-blue transition-colors">key</span>
                                </div>
                                <input
                                    id="accessCode"
                                    name="accessCode"
                                    type="text"
                                    required
                                    className="glass-input w-full rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-white/20 outline-none focus:ring-0 font-mono tracking-wider"
                                    placeholder="CODE-123"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="mt-4 w-full h-12 rounded-xl bg-gradient-to-r from-stitch-blue to-[#5b5bf0] hover:to-[#6c6cf5] text-white font-semibold shadow-lg shadow-stitch-blue/25 hover:shadow-stitch-blue/40 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 group"
                        >
                            <span>Enter Project</span>
                            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform">login</span>
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-transparent px-2 text-white/40 backdrop-blur-sm rounded-sm">Or</span>
                        </div>
                    </div>

                    <div className="text-center">
                        <Link href="/login" className="text-sm text-white/60 hover:text-stitch-blue font-medium transition-colors">
                            Admin Login
                        </Link>
                    </div>
                </div>

                {/* Bottom decorative elements */}
                <div className="mt-6 flex justify-center items-center gap-6 text-white/20 text-xs">
                    <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">secure</span>
                        Secure Access
                    </span>
                </div>
            </div>
        </div>
    )
}
