'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Trash2 } from 'lucide-react'

// Define Task Type locally or import shared type
export type Task = {
    id: string
    title: string
    description?: string
    column_id: 'IDEA' | 'TODO' | 'IN_PROGRESS' | 'DONE'
    priority: 'LOW' | 'MEDIUM' | 'HIGH'
    created_by: string
    media_urls?: string[]
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

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="opacity-30 bg-slate-50 p-4 rounded-lg border-2 border-dashed border-primary h-[100px]"
            />
        )
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => onClick?.(task)}
            className="group/card relative flex flex-col bg-white rounded-lg border border-slate-200 p-3 shadow-card-subtle hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 cursor-grab active:cursor-grabbing"
        >
            {/* Top Row: ID and Priority */}
            <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-medium text-slate-400">
                    {/* Mock ID generation or use ID substring */}
                    SW-{task.id.slice(0, 3).toUpperCase()}
                </span>
                <div
                    className={`size-2 rounded-full ${task.priority === 'HIGH' ? 'bg-red-500' :
                            task.priority === 'MEDIUM' ? 'bg-orange-400' :
                                'bg-slate-300'
                        }`}
                    title={task.priority}
                ></div>
            </div>

            {/* Title */}
            <h3 className="text-sm font-medium text-slate-900 leading-snug mb-3">
                {task.title}
            </h3>

            {/* Thumbnail */}
            {task.media_urls && task.media_urls.length > 0 && (
                <div className="mb-3 h-24 rounded bg-slate-100 overflow-hidden relative">
                    <img src={task.media_urls[0]} alt="Attachment" className="absolute inset-0 h-full w-full object-cover opacity-90" />
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
                {/* Tag */}
                <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
                        Task
                    </span>
                </div>

                {/* Right Side: Avatars, Icons, Delete */}
                <div className="flex items-center gap-3">
                    {/* Avatars */}
                    <div className="flex items-center -space-x-1.5">
                        <div className="h-5 w-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[9px] font-bold border border-white">
                            {task.created_by.charAt(0).toUpperCase()}
                        </div>
                    </div>

                    {/* Icons */}
                    <div className="flex items-center gap-2 text-slate-400">
                        {task.media_urls && task.media_urls.length > 0 && (
                            <div className="flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-[14px]">attachment</span>
                                <span className="text-[10px] font-medium">{task.media_urls.length}</span>
                            </div>
                        )}
                        {/* Mock chat count */}
                        {/* <div className="flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[14px]">chat_bubble</span>
                            <span className="text-[10px] font-medium">0</span>
                        </div> */}
                    </div>

                    {onDelete && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(task.id);
                            }}
                            className="opacity-0 group-hover/card:opacity-100 p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded transition-all"
                        >
                            <Trash2 size={12} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
