'use client'

import Link from 'next/link'
import { logout } from '@/app/actions/auth'
import { startTransition } from 'react'

export function Sidebar({ user }: { user: any }) {
    function handleLogout() {
        if (!confirm('Çıkış yapmak istediğinize emin misiniz?')) return
        startTransition(() => {
            logout()
        })
    }

    return (
        <aside className="hidden md:flex w-20 flex-col items-center border-r border-gray-200 bg-charcoal py-8 transition-all duration-300 ease-in-out z-20 shadow-xl fixed h-full left-0 top-0">
            {/* Logo */}
            <div className="mb-10 flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-lg shadow-primary/30 overflow-hidden">
                <img src="/logo.svg" alt="Swarm Connection" className="h-full w-full object-cover" />
            </div>
            {/* Nav Items */}
            <nav className="flex flex-1 flex-col items-center gap-6">
                <Link href="/dashboard" className="group relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all hover:bg-primary hover:text-white">
                    <span className="material-symbols-outlined text-[24px]">dashboard</span>
                    <span className="absolute left-14 hidden rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white shadow-lg group-hover:block z-50 whitespace-nowrap">Dashboard</span>
                </Link>

                <div className="h-px w-8 bg-gray-200"></div>
            </nav>
            {/* Bottom Actions */}
            <div className="mt-auto flex flex-col items-center gap-4">
                <Link href="#" className="group relative flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 transition-all hover:bg-white/10 hover:text-white">
                    <span className="material-symbols-outlined text-[22px]">settings</span>
                    <span className="absolute left-14 hidden rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:block group-hover:opacity-100 z-50 whitespace-nowrap">Ayarlar</span>
                </Link>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="group relative flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 transition-all hover:bg-rose-500/10 hover:text-rose-400"
                >
                    <span className="material-symbols-outlined text-[22px]">logout</span>
                    <span className="absolute left-14 hidden rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:block group-hover:opacity-100 z-50 whitespace-nowrap">Çıkış Yap</span>
                </button>

                <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-gray-600 bg-gray-700 flex items-center justify-center text-white font-bold text-xs cursor-pointer hover:border-gray-400 transition-colors" title={user.email}>
                    {user.email?.charAt(0).toUpperCase()}
                </div>
            </div>
        </aside>
    )
}
