'use client'

import Link from 'next/link'

export function WeeklyVelocity({ data }: { data: any[] }) {
    // data: [{ day: 'M', count: 5, date: '...' }, ...]
    // Find max count to normalize height
    const maxCount = Math.max(...data.map(d => d.count), 1) // Avoid divide by zero

    return (
        <div className="col-span-1 lg:col-span-2 xl:col-span-2 overflow-hidden rounded-2xl bg-white p-6 shadow-bento ring-1 ring-gray-100 flex flex-col justify-between h-auto">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="font-bold text-gray-900">Weekly Velocity</h3>
                    <p className="text-xs text-gray-500">Tasks created over last 7 days</p>
                </div>
                <select className="rounded-lg border-gray-200 bg-gray-50 text-xs font-medium text-gray-600 focus:border-primary focus:ring-primary outline-none py-1">
                    <option>This Week</option>
                    <option>Last Week</option>
                </select>
            </div>
            {/* CSS-only Bar Chart */}
            <div className="flex h-32 items-end justify-between gap-2 px-2">
                {data.map((bar, i) => {
                    const heightPercentage = Math.round((bar.count / maxCount) * 85) + 15 // min 15% height
                    const isToday = i === data.length - 1 // Last item is today

                    return (
                        <div key={i} className="group relative flex w-full flex-col items-center gap-2 h-full justify-end">
                            <div
                                className={`w-full rounded-t-sm transition-all shadow-sm ${isToday ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-gray-100 group-hover:bg-primary/20'}`}
                                style={{ height: `${heightPercentage}%` }}
                                title={`${bar.count} tasks`}
                            ></div>
                            <span className={`text-[10px] ${isToday ? 'font-bold text-primary' : 'text-gray-400'}`}>{bar.day}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export function RecentActivity({ activities }: { activities: any[] }) {
    return (
        <div className="col-span-1 lg:col-span-2 xl:col-span-2 overflow-hidden rounded-2xl bg-white p-6 shadow-bento ring-1 ring-gray-100 h-auto">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Recent Activity</h3>
                <Link href="#" className="text-xs font-medium text-primary hover:underline">View All</Link>
            </div>
            <div className="relative pl-4 border-l border-gray-100 space-y-6">
                {activities.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No recent activity.</p>
                ) : (
                    activities.map((activity, index) => (
                        <div key={activity.id || index} className="relative">
                            <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-white animate-pulse"></span>
                            <p className="text-sm text-gray-900">
                                <span className="font-semibold">{activity.user}</span> {activity.content} <span className="font-medium text-primary">{activity.project_name}</span>
                            </p>
                            <p className="mt-1 text-xs text-gray-500">{new Date(activity.created_at).toLocaleString()}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export function UpcomingDeadlines({ deadlines }: { deadlines: any[] }) {
    return (
        <div className="col-span-1 lg:col-span-2 xl:col-span-2 overflow-hidden rounded-2xl bg-white p-6 shadow-bento ring-1 ring-gray-100 h-auto">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Upcoming Deadlines</h3>
                <Link href="#" className="text-xs font-medium text-primary hover:underline">View All</Link>
            </div>
            <div className="flex flex-col gap-3">
                {deadlines && deadlines.length > 0 ? (
                    deadlines.map((deadline) => (
                        <div key={deadline.id} className="group flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-3 transition-colors hover:border-primary/20 hover:bg-white">
                            <div className={`flex h-10 w-10 flex-none items-center justify-center rounded-lg ${deadline.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-primary'}`}>
                                <span className="material-symbols-outlined text-[20px]">event</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="truncate text-sm font-semibold text-gray-900">{deadline.title}</h4>
                                <p className="truncate text-xs text-gray-500">{deadline.project_name} • {new Date(deadline.due_date).toLocaleDateString()}</p>
                            </div>
                            {deadline.priority === 'High' && (
                                <span className="flex-none rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-700">Urgent</span>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center text-gray-500">
                        <span className="material-symbols-outlined text-[24px] mb-2 text-gray-400">event_busy</span>
                        <p className="text-sm">No upcoming deadlines</p>
                    </div>
                )}
            </div>
        </div>
    )
}
