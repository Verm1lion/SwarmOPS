'use client'

import { SortableContext, useSortable } from '@dnd-kit/sortable'
import { Task, TaskCard } from './TaskCard'
import { useMemo } from 'react'
import { CSS } from '@dnd-kit/utilities'

import { NewTaskDialog } from './NewTaskDialog'

interface ColumnProps {
    column: {
        id: string
        title: string
    }
    tasks: Task[]
    onDeleteTask: (id: string) => void
    projectId: string
    currentUser: string
    onTaskCreated: (task: any) => void
    onTaskClick?: (task: Task) => void
}

export function Column({ column, tasks, onDeleteTask, projectId, currentUser, onTaskCreated, onTaskClick }: ColumnProps) {
    const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks])

    const { setNodeRef } = useSortable({
        id: column.id,
        data: {
            type: 'Column',
            column,
        }
    })

    return (
        <div
            ref={setNodeRef}
            className="flex h-full w-[300px] min-w-[300px] flex-col group"
        >
            {/* Column Header */}
            <div className="mb-4 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                        {column.title}
                    </span>
                    <span className="flex items-center justify-center size-5 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold">
                        {tasks.length}
                    </span>
                </div>
                <button
                    onClick={() => {
                        // Ideally checking for "add task" permission here or triggering dialog
                        // Since dialog is at bottom, this button might be redundant or could open same dialog
                        // For now just visual match or could hook to dialog
                    }}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 transition-opacity"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                </button>
            </div>

            {/* Task List */}
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto pb-4 no-scrollbar">
                <SortableContext items={taskIds}>
                    {tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onDelete={onDeleteTask}
                            onClick={onTaskClick}
                        />
                    ))}
                </SortableContext>

                {/* Ghost Button at bottom of column */}
                <NewTaskDialog
                    projectId={projectId}
                    currentUser={currentUser}
                    onTaskCreated={onTaskCreated}
                    variant="ghost"
                    defaultColumnId={column.id}
                />
            </div>
        </div>
    )
}
