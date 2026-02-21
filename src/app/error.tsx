'use client'

import { useEffect } from 'react'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Application Error:', error)
    }, [error])

    return (
        <div className="flex min-h-screen items-center justify-center bg-white px-6">
            <div className="text-center max-w-md">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-rose-50">
                    <span className="material-symbols-outlined text-4xl text-rose-500">error</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Bir Hata Oluştu</h1>
                <p className="text-sm text-gray-500 mb-6">
                    Beklenmedik bir sorun yaşandı. Lütfen tekrar deneyin.
                </p>
                <button
                    onClick={reset}
                    className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all active:scale-95"
                >
                    Tekrar Dene
                </button>
            </div>
        </div>
    )
}
