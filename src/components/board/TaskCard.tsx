'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Trash2 } from 'lucide-react'
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'
import { MouseEvent } from 'react'

// Define Task Type locally or import shared type
export type Task = {
    id: string
    title: string
    description?: string
    column_id: 'IDEA' | 'TODO' | 'IN_PROGRESS' | 'DONE'
    priority: 'LOW' | 'MEDIUM' | 'HIGH'
    created_by: string
    media_urls?: string[]
    start_date?: string
    due_date?: string
    labels?: string[]
    completed_at?: string
}

interface TaskCardProps {
    task: Task
    onDelete?: (id: string) => void
    isAdminOrOwner?: boolean
    onClick?: (task: Task) => void
}

export function TaskCard({ task, onDelete, isAdminOrOwner, onClick }: TaskCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: task.id,
        data: {
            type: 'Task',
            task,
        },
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    // Glow Effect
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    // IMPORTANT: useMotionTemplate MUST be called before any early return
    // to maintain consistent hook call order (React rules of hooks)
    const glowBackground = useMotionTemplate`
        radial-gradient(
        650px circle at ${mouseX}px ${mouseY}px,
        rgba(99, 102, 241, 0.10),
        transparent 80%
        )
    `

    function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect()
        mouseX.set(clientX - left)
        mouseY.set(clientY - top)
    }

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="opacity-30 bg-slate-50 p-4 rounded-2xl border-2 border-dashed border-indigo-500 h-[100px]"
            />
        )
    }

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => onClick?.(task)}
            onMouseMove={handleMouseMove}
            className="group/card relative flex flex-col bg-white rounded-2xl border border-slate-100 p-3 shadow-sm transition-all cursor-grab active:cursor-grabbing overflow-hidden h-[150px] shrink-0"
            whileHover={{
                y: -4,
                boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
            }}
            whileTap={{ scale: 0.98 }}
        >
            {/* Glow Overlay */}
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover/card:opacity-100"
                style={{
                    background: glowBackground,
                }}
            />

            {/* Top Row: ID and Priority */}
            <div className="flex items-start justify-between mb-2 relative z-10">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                    SW-{task.id.slice(0, 3).toUpperCase()}
                </span>
                <div
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${task.priority === 'HIGH' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        task.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}
                >
                    {task.priority === 'HIGH' ? 'High' : task.priority === 'MEDIUM' ? 'Med' : 'Low'}
                </div>
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold text-slate-800 leading-relaxed mb-2 relative z-10 line-clamp-2">
                {task.title}
            </h3>

            {/* Thumbnail */}
            {task.media_urls && task.media_urls.length > 0 && (
                <div className="mb-2 h-20 rounded-xl bg-slate-50 overflow-hidden relative group-hover/card:shadow-md transition-all">
                    <img src={task.media_urls[0]} alt="Attachment" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-110" />
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50 relative z-10">
                {/* Tag & Due Date */}
                <div className="flex items-center gap-2 flex-wrap max-w-[70%]">
                    {task.labels && task.labels.length > 0 ? (
                        task.labels.slice(0, 2).map((label, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100/50 truncate max-w-[80px]">
                                {label}
                            </span>
                        ))
                    ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-50 text-slate-400 border border-slate-100">
                            Task
                        </span>
                    )}
                </div>

                {/* Right Side: Avatars, Icons, Delete */}
                <div className="flex items-center gap-3">
                    {/* Date info: completed_at for DONE, due_date otherwise */}
                    {task.column_id === 'DONE' && task.completed_at ? (
                        <span suppressHydrationWarning className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                            ✓ {new Date(task.completed_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                    ) : task.due_date ? (
                        <span suppressHydrationWarning className={`flex items-center gap-1 text-[10px] font-bold ${new Date(task.due_date) < new Date() ? 'text-rose-500' : 'text-slate-400'}`}>
                            {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                    ) : null}

                    {/* Avatars */}
                    <div className="h-6 w-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-sm ring-1 ring-slate-100">
                        {task.created_by.charAt(0).toUpperCase()}
                    </div>

                    {onDelete && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(task.id);
                            }}
                            className="opacity-0 group-hover/card:opacity-100 p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-all"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
