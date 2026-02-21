'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'

// Dynamically import 3D components with no SSR to avoid Canvas issues
const VelocityChart3D = dynamic(() => import('@/components/dashboard/3d/VelocityChart3D'), { ssr: false })
const CompletionRing3D = dynamic(() => import('@/components/dashboard/3d/CompletionRing3D'), { ssr: false })

import CountUp from 'react-countup'

// ... existing imports

export function WeeklyVelocity({ data, averageVelocity }: { data: any[], averageVelocity: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="col-span-1 lg:col-span-2 xl:col-span-2 overflow-hidden rounded-2xl bg-white p-6 shadow-bento ring-1 ring-gray-100 flex flex-col justify-between h-[300px]"
        >
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h3 className="font-bold text-gray-900">True Velocity</h3>
                    <p className="text-xs text-gray-500">Tasks completed (DONE) in last 7 days</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Avg Speed</p>
                    <p className="text-lg font-bold text-indigo-600">
                        <CountUp end={averageVelocity} decimals={1} duration={2} /> <span className="text-xs text-gray-400 font-normal">tasks/day</span>
                    </p>
                </div>
            </div>

            <div className="flex-1 w-full relative">
                <VelocityChart3D data={data} />
            </div>
        </motion.div>
    )
}

// ... CompletionRateCard
export function CompletionRateCard({ efficiency }: { efficiency: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="col-span-1 lg:col-span-1 xl:col-span-1 overflow-hidden rounded-2xl bg-white p-6 shadow-bento ring-1 ring-gray-100 flex flex-col items-center justify-between h-[300px]"
        >
            <h3 className="font-bold text-gray-900 w-full text-left">Completion Rate</h3>
            <div className="flex-1 w-full relative">
                <CompletionRing3D progress={efficiency} />
            </div>
            <p className="text-xs text-center text-gray-400">Total tasks vs Completed</p>
        </motion.div>
    )
}

export function EstimatedCompletionCard({ etcDays }: { etcDays: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="col-span-1 lg:col-span-1 xl:col-span-1 overflow-hidden rounded-2xl bg-white p-6 shadow-bento ring-1 ring-gray-100 flex flex-col justify-between h-[300px]"
        >
            <h3 className="font-bold text-gray-900">Est. Completion</h3>

            <div className="flex flex-1 flex-col items-center justify-center">
                {etcDays === 999 ? (
                    <div className="text-center">
                        <span className="material-symbols-outlined text-[48px] text-gray-300 mb-2">hourglass_disabled</span>
                        <p className="text-sm text-gray-500">Not enough data</p>
                    </div>
                ) : (
                    <div className="text-center">
                        <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-purple-600 font-mono tracking-tighter">
                            <CountUp end={etcDays} duration={2.5} />
                        </span>
                        <p className="text-sm font-bold text-gray-600 mt-2 uppercase tracking-widest">DAYS</p>
                    </div>
                )}
            </div>

            <div className="w-full bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400">Based on current team velocity</p>
            </div>
        </motion.div>
    )
}

export function RecentActivity({ activities }: { activities: any[] }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="col-span-1 lg:col-span-2 xl:col-span-2 overflow-hidden rounded-2xl bg-white p-6 shadow-bento ring-1 ring-gray-100 h-auto"
        >
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
                            <p className="mt-1 text-xs text-gray-500" suppressHydrationWarning>{new Date(activity.created_at).toLocaleString()}</p>
                        </div>
                    ))
                )}
            </div>
        </motion.div>
    )
}

export function UpcomingDeadlines({ deadlines }: { deadlines: any[] }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="col-span-1 lg:col-span-2 xl:col-span-2 overflow-hidden rounded-2xl bg-white p-6 shadow-bento ring-1 ring-gray-100 h-auto"
        >
            <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Upcoming Deadlines</h3>
                <Link href="#" className="text-xs font-medium text-primary hover:underline">View All</Link>
            </div>
            <div className="flex flex-col gap-3">
                {deadlines && deadlines.length > 0 ? (
                    deadlines.map((deadline: any) => (
                        <div key={deadline.id} className="group flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-3 transition-colors hover:border-primary/20 hover:bg-white">
                            <div className={`flex h-10 w-10 flex-none items-center justify-center rounded-lg ${deadline.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-primary'}`}>
                                <span className="material-symbols-outlined text-[20px]">event</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="truncate text-sm font-semibold text-gray-900">{deadline.title}</h4>
                                <p className="truncate text-xs text-gray-500" suppressHydrationWarning>{deadline.project_name} • {new Date(deadline.due_date).toLocaleDateString()}</p>
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
        </motion.div>
    )
}
