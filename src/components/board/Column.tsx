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
            className="flex max-h-full w-[300px] min-w-[300px] flex-col group rounded-2xl bg-gray-50/50 border border-gray-200/60"
        >
            {/* Column Header */}
            <div className="mb-2 flex items-center justify-between p-4 pb-2">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {column.title}
                    </span>
                    <span className="flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-gray-200/50 text-gray-600 text-[11px] font-bold">
                        {tasks.length}
                    </span>
                </div>
                <button
                    onClick={() => {
                        // Ideally checking for "add task" permission here or triggering dialog
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-white text-gray-400 hover:text-gray-700 transition-all shadow-sm"
                >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                </button>
            </div>

            {/* Task List - Restricted height to approx 4 tasks per user request */}
            <div className="flex flex-col gap-3 overflow-y-auto px-3 pb-4 max-h-[580px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 transition-colors">
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
