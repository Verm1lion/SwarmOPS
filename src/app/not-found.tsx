import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-white px-6">
            <div className="text-center max-w-md">
                <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">404</h1>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Sayfa Bulunamadı</h2>
                <p className="text-sm text-gray-500 mb-8">
                    Aradığınız sayfa mevcut değil veya taşınmış olabilir.
                </p>
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all active:scale-95"
                >
                    <span className="material-symbols-outlined text-[18px]">home</span>
                    Dashboard'a Dön
                </Link>
            </div>
        </div>
    )
}
