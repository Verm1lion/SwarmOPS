export default function Loading() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
                <div className="relative h-12 w-12">
                    <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin"></div>
                </div>
                <p className="text-sm font-medium text-gray-400 animate-pulse">Yükleniyor...</p>
            </div>
        </div>
    )
}
