'use client'

import { createProject, deleteProject } from '@/app/actions/project'
import Link from 'next/link'
import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { RecentActivity, UpcomingDeadlines, WeeklyVelocity } from './StatsTiles'
import { Sidebar } from '../Sidebar'

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-lg shadow-primary/30 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
        >
            {pending ? 'Creating...' : 'Create Project'}
        </button>
    )
}

interface DashboardClientProps {
    user: any
    isGuest?: boolean
    projects?: any[]
    tasks?: any[]
    stats?: {
        activeProjects: number
        efficiency: number
        teamLoad: number
        totalTasks: number
    }
    recentActivity?: any[]
    velocity?: any[]
    upcomingDeadlines?: any[]
}

export default function DashboardClient({
    user,
    isGuest = false,
    projects = [],
    tasks = [],
    stats = { activeProjects: 0, efficiency: 0, teamLoad: 0, totalTasks: 0 },
    recentActivity = [],
    velocity = [],
    upcomingDeadlines = []
}: DashboardClientProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const heroProject = projects.length > 0 ? projects[0] : null

    // Calculate Hero Project Progress
    const heroTasks = heroProject ? tasks.filter((t: any) => t.project_id === heroProject.id) : []
    const heroCompleted = heroTasks.filter((t: any) => t.column_id === 'DONE').length
    const heroTotal = heroTasks.length
    const heroProgress = heroTotal > 0 ? Math.round((heroCompleted / heroTotal) * 100) : 0
    const heroOpenIssues = heroTotal - heroCompleted

    return (
        <div className="flex h-screen w-full bg-background-light text-slate-900 font-sans overflow-hidden">
            <Sidebar user={user} />

            {/* Main Content */}
            <main className="flex flex-1 flex-col overflow-hidden bg-background-light ml-0 md:ml-20 transition-all duration-300">
                {/* Header */}
                <header className="flex h-20 items-center justify-between px-8 py-4 backdrop-blur-sm">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>
                        <p className="text-sm text-gray-500">
                            {isGuest ? 'Welcome, Guest' : `Welcome back, ${user?.email?.split('@')[0]}`}
                        </p>
                    </div>
                    <div className="flex items-center gap-6">
                        {/* Search */}
                        <div className="relative hidden w-96 md:block">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                            <input className="h-11 w-full rounded-xl border-none bg-white py-2 pl-10 pr-4 text-sm text-gray-700 shadow-sm ring-1 ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Search projects, tasks, or team..." type="text" />
                        </div>
                        {/* Notifications */}
                        <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-600 shadow-sm ring-1 ring-gray-200 hover:text-primary relative transition-colors">
                            <span className="material-symbols-outlined text-[20px]">notifications</span>
                            <span className="absolute right-[10px] top-[10px] h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                        </button>
                        {/* New Project Button - Hidden for Guests */}
                        {!isGuest && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-white shadow-lg shadow-primary/30 transition-transform hover:scale-[1.02] active:scale-95"
                            >
                                <span className="material-symbols-outlined text-[18px]">add</span>
                                <span>New Project</span>
                            </button>
                        )}
                    </div>
                </header>

                {/* Bento Grid Content */}
                <div className="flex-1 overflow-y-auto p-8 pt-2">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 xl:grid-cols-4 auto-rows-min pb-10">

                        {/* Stat Card 1: Active Projects */}
                        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-bento ring-1 ring-gray-100 transition-all hover:shadow-lg">
                            <div className="flex items-start justify-between">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-primary">
                                    <span className="material-symbols-outlined">folder</span>
                                </div>
                                <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">trending_up</span> 12%
                                </span>
                            </div>
                            <div className="mt-4">
                                <p className="text-3xl font-bold text-gray-900">{stats.activeProjects}</p>
                                <p className="text-sm font-medium text-gray-500">Active Projects</p>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0 opacity-50"></div>
                        </div>

                        {/* Stat Card 2: Efficiency Score */}
                        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-bento ring-1 ring-gray-100 transition-all hover:shadow-lg">
                            <div className="flex items-start justify-between">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                                    <span className="material-symbols-outlined">bolt</span>
                                </div>
                                <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">trending_up</span> 5%
                                </span>
                            </div>
                            <div className="mt-4">
                                <p className="text-3xl font-bold text-gray-900">{stats.efficiency}%</p>
                                <p className="text-sm font-medium text-gray-500">Efficiency Score</p>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500/0 via-purple-500/40 to-purple-500/0 opacity-50"></div>
                        </div>

                        {/* Stat Card 3: Team Load */}
                        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-bento ring-1 ring-gray-100 transition-all hover:shadow-lg">
                            <div className="flex items-start justify-between">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                                    <span className="material-symbols-outlined">groups</span>
                                </div>
                                <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">trending_down</span> 2%
                                </span>
                            </div>
                            <div className="mt-4">
                                <p className="text-3xl font-bold text-gray-900">{stats.teamLoad}/10</p>
                                <p className="text-sm font-medium text-gray-500">Team Load</p>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500/0 via-orange-500/40 to-orange-500/0 opacity-50"></div>
                        </div>

                        {/* Stat Card 4: Total Tasks */}
                        <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-bento ring-1 ring-gray-100 transition-all hover:shadow-lg">
                            <div className="flex items-start justify-between">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                    <span className="material-symbols-outlined">assignment</span>
                                </div>
                                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">trending_flat</span> 0%
                                </span>
                            </div>
                            <div className="mt-4">
                                <p className="text-3xl font-bold text-gray-900">{stats.totalTasks}</p>
                                <p className="text-sm font-medium text-gray-500">Total Tasks</p>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500/0 via-indigo-500/40 to-indigo-500/0 opacity-50"></div>
                        </div>

                        {/* Hero Project Card (Spans 2 cols, 2 rows) */}
                        {heroProject ? (
                            <div className="col-span-1 lg:col-span-2 xl:col-span-2 row-span-2 overflow-hidden rounded-2xl bg-white shadow-bento ring-1 ring-gray-100 group relative flex flex-col">
                                {/* Image Area */}
                                <div className="relative h-48 w-full overflow-hidden bg-gray-900 flex-shrink-0">
                                    <img
                                        src="/header.jpg"
                                        alt="Project Background"
                                        className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>

                                    <div className="absolute bottom-4 left-6">
                                        <div className="mb-2 inline-flex items-center gap-1 rounded-lg bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-md shadow-inner border border-white/20 animate-pulse-slow">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                            </span>
                                            Active
                                        </div>
                                        <h2 className="text-2xl font-bold text-white shadow-sm">{heroProject.name}</h2>
                                    </div>

                                    <div
                                        className="absolute right-6 top-6 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-800 backdrop-blur-md shadow-sm cursor-pointer hover:bg-white active:scale-95 transition-all flex items-center gap-2"
                                        onClick={() => navigator.clipboard.writeText(heroProject.access_code)}
                                        title="Copy Access Code"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">key</span>
                                        Access Code: {heroProject.access_code}
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="p-6 flex flex-col flex-1 justify-between">
                                    <div className="mb-6 flex items-end justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Project Progress</p>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-3xl font-bold text-gray-900">{heroProgress}%</span>
                                                <span className="text-sm font-medium text-green-600">On Track</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">Deadline</p>
                                            <p className="font-semibold text-gray-900">Oct 24, 2026</p> {/* Mock Deadline */}
                                        </div>
                                    </div>

                                    {/* Sleek Progress Bar */}
                                    <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                                        <div className="h-full rounded-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${heroProgress}%` }}></div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="rounded-xl bg-gray-50 p-4">
                                            <div className="mb-1 flex items-center gap-2 text-gray-500">
                                                <span className="material-symbols-outlined text-[18px]">bug_report</span>
                                                <span className="text-xs font-medium uppercase tracking-wider">Open Tasks</span>
                                            </div>
                                            <p className="text-xl font-bold text-gray-900">{heroOpenIssues}</p>
                                        </div>
                                        <div className="rounded-xl bg-gray-50 p-4">
                                            <div className="mb-1 flex items-center gap-2 text-gray-500">
                                                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                                <span className="text-xs font-medium uppercase tracking-wider">Completed</span>
                                            </div>
                                            <p className="text-xl font-bold text-gray-900">{heroCompleted}</p>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-between items-center">
                                        <Link href={`/board/${heroProject.id}`} className="text-sm font-medium text-primary hover:text-primary-dark hover:underline flex items-center gap-1">
                                            View Project Details <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="col-span-1 lg:col-span-2 xl:col-span-2 row-span-2 overflow-hidden rounded-2xl bg-white shadow-bento ring-1 ring-gray-100 flex items-center justify-center p-10 flex-col gap-4 text-center">
                                <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                                    <span className="material-symbols-outlined text-[32px]">folder_off</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">No Projects Found</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {isGuest ? 'Ask an admin to create a project.' : 'Create your first project to get started.'}
                                    </p>
                                </div>
                                {!isGuest && (
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="mt-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-lg shadow-primary/30 transition-transform hover:scale-[1.02] active:scale-95"
                                    >
                                        Create Project
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Widgets */}
                        <UpcomingDeadlines deadlines={upcomingDeadlines} />
                        <WeeklyVelocity data={velocity} />
                        <div className="col-span-1 lg:col-span-4 xl:col-span-4">
                            <RecentActivity activities={recentActivity} />
                        </div>

                    </div>
                </div>
            </main>

            {/* Create Project Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-gray-200 zoom-in-95 animate-in">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Create New Project</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form action={async (formData) => {
                            const result = await createProject(formData)
                            if (result?.success) {
                                setIsModalOpen(false)
                            }
                            // Explicitly return nothing to satisfy void return type
                            return
                        }} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="w-full rounded-xl border-gray-200 px-4 py-2.5 text-sm focus:border-primary focus:ring-primary outline-none transition-shadow"
                                    placeholder="e.g. Website Redesign"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <SubmitButton />
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
