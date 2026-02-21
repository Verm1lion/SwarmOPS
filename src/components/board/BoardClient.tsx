'use client'

import { useState, useEffect, startTransition } from 'react'
import { toast } from 'sonner'
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { Sidebar } from '@/components/Sidebar'
import { Column } from '@/components/board/Column'
import { TaskCard, Task } from '@/components/board/TaskCard'
import { NewTaskDialog } from '@/components/board/NewTaskDialog'
import { updateTaskColumn, deleteTask } from '@/app/actions/task'
import Link from 'next/link'
import { TaskDetailsDialog } from '@/components/board/TaskDetailsDialog'

interface BoardProps {
    initialTasks: Task[]
    projectId: string
    projectName: string
    currentUser: string
    isGuest: boolean
}

const COLUMNS = [
    { id: 'IDEA', title: 'FİKİR' },
    { id: 'TODO', title: 'SIRADA' },
    { id: 'IN_PROGRESS', title: 'DEVAM EDİLİYOR' },
    { id: 'DONE', title: 'TAMAMLANDI' },
]

export default function BoardClient({ initialTasks, projectId, projectName, currentUser, isGuest }: BoardProps) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks)
    const [activeId, setActiveId] = useState<string | null>(null)
    const [currentView, setCurrentView] = useState('board')
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [priorityFilter, setPriorityFilter] = useState<string>('ALL')
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority'>('newest')

    // Filter & sort logic
    const filteredTasks = tasks.filter(t => {
        const matchesSearch = searchQuery === '' || t.title.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter
        return matchesSearch && matchesPriority
    }).sort((a, b) => {
        if (sortBy === 'priority') {
            const p = { HIGH: 0, MEDIUM: 1, LOW: 2 }
            return (p[a.priority] ?? 2) - (p[b.priority] ?? 2)
        }
        return 0 // default: keep order from DB (newest first)
    })

    useEffect(() => {
        setTasks(initialTasks)
    }, [initialTasks])

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            }
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    function handleDragStart(event: DragStartEvent) {
        setActiveId(event.active.id as string)
    }

    function handleDragOver(event: DragOverEvent) {
        const { active, over } = event
        if (!over) return

        const activeId = active.id as string
        const overId = over.id as string

        if (activeId === overId) return

        const isActiveTask = active.data.current?.type === 'Task'
        const isOverTask = over.data.current?.type === 'Task'
        const isOverColumn = over.data.current?.type === 'Column'

        if (!isActiveTask) return

        if (isActiveTask && isOverTask) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId)
                const overIndex = tasks.findIndex((t) => t.id === overId)

                if (tasks[activeIndex].column_id !== tasks[overIndex].column_id) {
                    const newTasks = [...tasks]
                    newTasks[activeIndex] = { ...newTasks[activeIndex], column_id: tasks[overIndex].column_id }
                    return arrayMove(newTasks, activeIndex, overIndex)
                }

                return arrayMove(tasks, activeIndex, overIndex)
            })
        }

        if (isActiveTask && isOverColumn) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId)
                const newColumnId = overId

                if (tasks[activeIndex].column_id !== newColumnId) {
                    const newTasks = [...tasks]
                    newTasks[activeIndex] = {
                        ...newTasks[activeIndex],
                        column_id: newColumnId as Task['column_id']
                    }
                    return arrayMove(newTasks, activeIndex, activeIndex)
                }
                return tasks
            })
        }
    }

    function handleDragEnd(event: DragEndEvent) {
        setActiveId(null)
        const { active, over } = event
        if (!over) return

        const activeId = active.id as string
        const activeTask = tasks.find((t) => t.id === activeId)

        if (activeTask) {
            const overId = over.id as string
            let newColumnId = activeTask.column_id

            if (over.data.current?.type === 'Column') {
                newColumnId = overId as Task['column_id']
            } else if (over.data.current?.type === 'Task') {
                const overTask = tasks.find(t => t.id === overId)
                if (overTask) {
                    newColumnId = overTask.column_id
                }
            }

            // Trigger Confetti if moved to DONE and wasn't there before
            if (newColumnId === 'DONE' && activeTask.column_id !== 'DONE') {
                import('canvas-confetti').then((confetti) => {
                    confetti.default({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#6366f1', '#818cf8', '#a5b4fc', '#ffffff'] // Indigo shades
                    })
                })
            }

            startTransition(() => {
                updateTaskColumn(activeId, newColumnId, projectId)
            })
        }
    }

    async function handleDelete(taskId: string) {
        setTasks(tasks.filter(t => t.id !== taskId))
        toast.success('Görev silindi')
        startTransition(() => {
            deleteTask(taskId, projectId)
        })
    }

    function handleTaskUpdate(updatedTask: Task) {
        setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t))
    }

    return (
        <div className="flex h-screen w-full bg-white bg-dot-pattern text-slate-900 font-sans overflow-hidden">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between bg-white/90 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
                <h1 className="text-sm font-bold text-slate-900 truncate">{projectName}</h1>
                <button
                    onClick={() => { startTransition(() => { import('@/app/actions/auth').then(m => m.logout()) }) }}
                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                >
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                </button>
            </div>
            <Sidebar user={{ email: currentUser + (isGuest ? ' (Guest)' : '') }} />

            <main className="flex flex-1 flex-col overflow-hidden bg-white/50 md:ml-20 pt-14 md:pt-0">
                {/* Header */}
                <header className="flex h-16 items-center justify-between px-6 py-4 backdrop-blur-sm border-b border-slate-100 bg-white/80 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg font-bold tracking-tight text-slate-900">{projectName}</h1>
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-medium">16 Şubat - 16 Mart</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="relative hidden md:block">
                            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Ara..."
                                className="h-9 w-48 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-0 outline-none transition-all"
                            />
                        </div>

                        {/* View Toggle */}
                        <div className="flex items-center bg-slate-100 p-1 rounded-lg">
                            <button
                                onClick={() => setCurrentView('board')}
                                className={`px-2 py-1 rounded transition-all ${currentView === 'board' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                <span className="material-symbols-outlined text-[18px]">view_kanban</span>
                            </button>
                            <button
                                onClick={() => setCurrentView('list')}
                                className={`px-2 py-1 rounded transition-all ${currentView === 'list' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                <span className="material-symbols-outlined text-[18px]">list</span>
                            </button>
                        </div>

                        <div className="h-6 w-px bg-slate-200 mx-1"></div>

                        {/* Priority Filter */}
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 font-medium focus:border-indigo-400 outline-none cursor-pointer"
                        >
                            <option value="ALL">Tüm Öncelik</option>
                            <option value="HIGH">Yüksek</option>
                            <option value="MEDIUM">Orta</option>
                            <option value="LOW">Düşük</option>
                        </select>

                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 font-medium focus:border-indigo-400 outline-none cursor-pointer"
                        >
                            <option value="newest">En Yeni</option>
                            <option value="oldest">En Eski</option>
                            <option value="priority">Önceliğe Göre</option>
                        </select>

                        <NewTaskDialog
                            projectId={projectId}
                            currentUser={currentUser}
                            onTaskCreated={(newTask) => setTasks([...tasks, newTask])}
                        />
                    </div>
                </header>

                {/* Board Content */}
                <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
                    <DndContext
                        id="board-dnd-context"
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="flex h-full gap-6 min-w-max items-start">
                            {COLUMNS.map((col) => (
                                <Column
                                    key={col.id}
                                    column={col}
                                    tasks={filteredTasks.filter((t) => t.column_id === col.id)}
                                    projectId={projectId}
                                    currentUser={currentUser}
                                    onTaskCreated={(newTask) => setTasks([...tasks, newTask])}
                                    // onDeleteTask is passed through Column to TaskCard
                                    onDeleteTask={handleDelete}
                                    onTaskClick={(task) => setSelectedTask(task)}
                                />
                            ))}
                        </div>

                        <DragOverlay>
                            {activeId ? (
                                <div className="rotate-2 cursor-grabbing w-[300px]">
                                    <TaskCard task={tasks.find((t) => t.id === activeId)!} />
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                </div>

                {/* Task Details Modal */}
                <TaskDetailsDialog
                    task={selectedTask}
                    isOpen={!!selectedTask}
                    onClose={() => setSelectedTask(null)}
                    projectId={projectId}
                    currentUser={currentUser}
                    onTaskUpdate={handleTaskUpdate}
                />
            </main>
        </div>
    )
}
