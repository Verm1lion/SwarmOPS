import { useState, useEffect } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { usePlanner } from '../hooks/usePlanner';
import { Column } from './Column';
import { NewTaskModal } from './NewTaskModal';
import { TaskDetailModal } from './TaskDetailModal';
import { ProjectSidebar } from './ProjectSidebar';
import { Task, TaskStatus } from '../types';

const statuses: TaskStatus[] = ['ideas', 'todo', 'in_progress', 'done'];

export function Board() {
  const { tasks, updateTaskStatus } = usePlanner();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);

  // Listen for openTask event from notifications
  useEffect(() => {
    const handleOpenTask = (event: CustomEvent) => {
      setSelectedTask(event.detail);
    };
    window.addEventListener('openTask', handleOpenTask as EventListener);
    return () => window.removeEventListener('openTask', handleOpenTask as EventListener);
  }, []);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStatus = destination.droppableId as TaskStatus;
    const task = tasks.find(t => t.id === draggableId);
    
    if (!task || task.status === newStatus) return;

    // Calculate new order (place at the end of the new column)
    const tasksInNewStatus = tasks.filter(t => t.status === newStatus);
    const newOrder = tasksInNewStatus.length;

    updateTaskStatus(draggableId, newStatus, newOrder);
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks
      .filter(task => task.status === status)
      .sort((a, b) => a.taskOrder - b.taskOrder);
  };

  return (
    <>
      {/* Kanban Board */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            {statuses.map((status) => (
              <Column
                key={status}
                status={status}
                tasks={getTasksByStatus(status)}
                onTaskClick={setSelectedTask}
              />
            ))}
          </DragDropContext>
        </div>
      </div>

      {/* Project Sidebar */}
      <ProjectSidebar onNewTask={() => setShowNewTaskModal(true)} />

      {showNewTaskModal && (
        <NewTaskModal onClose={() => setShowNewTaskModal(false)} />
      )}

      {selectedTask && (
        <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </>
  );
}
