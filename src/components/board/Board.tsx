'use client'

import { useState, useEffect, startTransition } from 'react'
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
import { Column } from './Column'
import { TaskCard, Task } from './TaskCard'
import { NewTaskDialog } from './NewTaskDialog'
import { updateTaskColumn, deleteTask } from '@/app/actions/task'

interface BoardProps {
    initialTasks: Task[]
    projectId: string
    currentUser: string
    isGuest: boolean
}

const COLUMNS = [
    { id: 'IDEA', title: 'FİKİR' },
    { id: 'TODO', title: 'SIRADA' },
    { id: 'IN_PROGRESS', title: 'DEVAM EDİLİYOR' },
    { id: 'DONE', title: 'TAMAMLANDI' },
]

export default function Board({ initialTasks, projectId, currentUser, isGuest }: BoardProps) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks)
    const [activeId, setActiveId] = useState<string | null>(null)

    useEffect(() => {
        setTasks(initialTasks)
    }, [initialTasks])

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Avoid accidental drags for clicks
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

        // Dropping over another Task
        if (isActiveTask && isOverTask) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId)
                const overIndex = tasks.findIndex((t) => t.id === overId)

                if (tasks[activeIndex].column_id !== tasks[overIndex].column_id) {
                    // Moving to different column
                    const newTasks = [...tasks]
                    newTasks[activeIndex] = { ...newTasks[activeIndex], column_id: tasks[overIndex].column_id }
                    return arrayMove(newTasks, activeIndex, overIndex)
                }

                // Same column reorder
                return arrayMove(tasks, activeIndex, overIndex)
            })
        }

        // Dropping over a Column
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
                    return arrayMove(newTasks, activeIndex, activeIndex) // Just update column, position logic is handled by sortable
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

        // Check if column changed in database
        if (activeTask) {
            // The local state is already updated by handleDragOver.
            // We just need to sync to server if needed.
            // But handleDragOver updates state optimistically.
            // We should ensure the final state is correct.

            const overId = over.id as string
            let newColumnId = activeTask.column_id // Default to current (updated)

            // If we dropped on a column, explicit override
            if (over.data.current?.type === 'Column') {
                newColumnId = overId as Task['column_id']
            } else if (over.data.current?.type === 'Task') {
                // If dropped on task, the state update in DragOver already handled column change.
                // We can trust activeTask.column_id from the latest state render?
                // Actually, 'tasks' in handleDragEnd might be stale closure if not careful?
                // No, standard function component behavior.
                // But let's act on the Event Data or assume DragOver did the work.

                // To be safe, we call updateTaskColumn with the current state's column for this task.
                // But wait, 'tasks' state inside this handleDragEnd might be the one BEFORE the last render?
                // No, closures capture the state at time of creation.
                // DragEnd is called after DragOver updates?
                // It's safer to recalculate:

                const overTask = tasks.find(t => t.id === overId)
                if (overTask) {
                    newColumnId = overTask.column_id
                }
            }

            // We trigger server action (silently) wrapped in startTransition to prevent React Error #300
            startTransition(() => {
                updateTaskColumn(activeId, newColumnId, projectId)
            })
        }
    }

    async function handleDelete(taskId: string) {
        if (!confirm('Bu görevi silmek istediğinize emin misiniz?')) return

        setTasks(tasks.filter(t => t.id !== taskId))
        startTransition(() => {
            deleteTask(taskId, projectId)
        })
    }

    return (
        <div className="flex h-full flex-col gap-4">
            <div className="flex justify-end px-4">
                {/* Dialog handles server action, we need to refresh locally or wait for revalidate */}
                {/* For simplicity we just let revalidatePath handle it, or we could pass a callback to append task */}
                <NewTaskDialog
                    projectId={projectId}
                    currentUser={currentUser}
                    onTaskCreated={(newTask) => setTasks([...tasks, newTask])}
                />
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex h-full gap-4 overflow-x-auto pb-4">
                    {COLUMNS.map((col) => (
                        <Column
                            key={col.id}
                            column={col}
                            tasks={tasks.filter((t) => t.column_id === col.id)}
                            onDeleteTask={handleDelete}
                            projectId={projectId}
                            currentUser={currentUser}
                            onTaskCreated={(newTask) => setTasks([...tasks, newTask])}
                        />
                    ))}
                </div>

                <DragOverlay>
                    {activeId ? (
                        <div className="rotate-2 cursor-grabbing">
                            <TaskCard task={tasks.find((t) => t.id === activeId)!} />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    )
}
