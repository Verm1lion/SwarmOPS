import { useState, useMemo } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Task, TaskStatus } from '../../types/domain';
import { usePlannerStore } from '../../hooks/usePlannerStore';
import { Column } from './Column';
import { TaskModal } from './TaskModal';
import { TaskCreateModal } from './TaskCreateModal';

export function Board() {
  const { projects, tasks, selectedProjectId, updateTask, deleteTask, moveTask, createTask, refreshTasks } = usePlannerStore();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createTaskStatus, setCreateTaskStatus] = useState<TaskStatus>('todo');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const projectTasks = useMemo(() => {
    return tasks.filter((t) => t.projectId === selectedProjectId);
  }, [tasks, selectedProjectId]);

  const filteredTasks = useMemo(() => {
    let filtered = projectTasks;
    if (searchQuery) {
      filtered = filtered.filter((t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }
    return filtered;
  }, [projectTasks, searchQuery, statusFilter]);

  const tasksByStatus = useMemo(() => {
    const byStatus: Record<TaskStatus, Task[]> = {
      ideas: [],
      todo: [],
      in_progress: [],
      done: [],
    };
    // Use filteredTasks for display, but we need to maintain order correctly
    filteredTasks.forEach((task) => {
      byStatus[task.status].push(task);
    });
    return byStatus;
  }, [filteredTasks]);

  // For drag and drop, we need all tasks (not filtered) to calculate correct order
  const allTasksByStatus = useMemo(() => {
    const byStatus: Record<TaskStatus, Task[]> = {
      ideas: [],
      todo: [],
      in_progress: [],
      done: [],
    };
    projectTasks.forEach((task) => {
      byStatus[task.status].push(task);
    });
    return byStatus;
  }, [projectTasks]);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, source, destination } = result;
    const sourceStatus = source.droppableId as TaskStatus;
    const destStatus = destination.droppableId as TaskStatus;

    if (sourceStatus === destStatus && source.index === destination.index) {
      return;
    }

    const task = projectTasks.find((t) => t.id === draggableId);
    if (!task) return;

    // Get all tasks in destination column (not filtered) for correct order calculation
    const destTasks = allTasksByStatus[destStatus];
    const sortedDestTasks = [...destTasks].sort((a, b) => a.order - b.order);
    
    // Calculate new order: place at the destination index
    // If index is beyond the list, place at the end
    let newOrder = destination.index;
    if (destination.index >= sortedDestTasks.length) {
      newOrder = sortedDestTasks.length;
    } else if (sortedDestTasks.length > 0) {
      // Use the order of the task at the destination index as reference
      const targetTask = sortedDestTasks[destination.index];
      newOrder = targetTask.order;
    }

    try {
      await moveTask(draggableId, destStatus, newOrder);
    } catch (error) {
      console.error('Failed to move task:', error);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleAddTask = (status: TaskStatus) => {
    setCreateTaskStatus(status);
    setIsCreateModalOpen(true);
  };

  const handleSaveTask = async (id: string, updates: Partial<Task>) => {
    const task = projectTasks.find((t) => t.id === id);
    if (!task) return;

    try {
      if (updates.status && updates.status !== task.status) {
        // Status changed - use moveTask to handle both status and order
        const newStatusTasks = projectTasks.filter((t) => t.status === updates.status && t.id !== id);
        const sortedNewStatusTasks = [...newStatusTasks].sort((a, b) => a.order - b.order);
        await moveTask(id, updates.status as TaskStatus, sortedNewStatusTasks.length);
        // Update other fields if any
        const otherUpdates = { ...updates };
        delete otherUpdates.status;
        if (Object.keys(otherUpdates).length > 0) {
          await updateTask(id, otherUpdates);
        }
      } else {
        // No status change - just update
        await updateTask(id, updates);
      }
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  if (!selectedProject) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <p>Select a project to view its board</p>
      </div>
    );
  }

  const ideasCount = projectTasks.filter((t) => t.status === 'ideas').length;
  const todoCount = projectTasks.filter((t) => t.status === 'todo').length;
  const inProgressCount = projectTasks.filter((t) => t.status === 'in_progress').length;
  const doneCount = projectTasks.filter((t) => t.status === 'done').length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{selectedProject.name}</h1>
            {selectedProject.description && (
              <p className="text-gray-600 mb-2">{selectedProject.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-gray-500">Join Code:</span>
              <div className="flex items-center gap-2">
                <code className="px-3 py-1 bg-gray-100 rounded-md font-mono font-bold text-lg text-gray-900">
                  {selectedProject.joinCode}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedProject.joinCode);
                    alert('Join code copied to clipboard!');
                  }}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  title="Copy join code"
                >
                  📋 Copy
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
          <span>Ideas ({ideasCount})</span>
          <span>·</span>
          <span>To Do ({todoCount})</span>
          <span>·</span>
          <span>In Progress ({inProgressCount})</span>
          <span>·</span>
          <span>Done ({doneCount})</span>
        </div>
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Show: All</option>
            <option value="ideas">Show: Ideas</option>
            <option value="todo">Show: To Do</option>
            <option value="in_progress">Show: In Progress</option>
            <option value="done">Show: Done</option>
          </select>
          <button
            onClick={() => refreshTasks()}
            className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            title="Refresh board to sync with other users"
          >
            🔄 Refresh
          </button>
        </div>
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto p-4">
          <div className="flex gap-4 h-full min-w-max">
            <Column
              status="ideas"
              tasks={tasksByStatus.ideas}
              onTaskClick={handleTaskClick}
              onAddTask={() => handleAddTask('ideas')}
            />
            <Column
              status="todo"
              tasks={tasksByStatus.todo}
              onTaskClick={handleTaskClick}
              onAddTask={() => handleAddTask('todo')}
            />
            <Column
              status="in_progress"
              tasks={tasksByStatus.in_progress}
              onTaskClick={handleTaskClick}
              onAddTask={() => handleAddTask('in_progress')}
            />
            <Column
              status="done"
              tasks={tasksByStatus.done}
              onTaskClick={handleTaskClick}
              onAddTask={() => handleAddTask('done')}
            />
          </div>
        </div>
      </DragDropContext>
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setSelectedTask(null);
          }}
          onSave={handleSaveTask}
          onDelete={async (id) => {
            try {
              await deleteTask(id);
            } catch (error) {
              console.error('Failed to delete task:', error);
            }
          }}
        />
      )}
      <TaskCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={async (taskData) => {
          try {
            await createTask({
              ...taskData,
              projectId: selectedProjectId!,
              status: createTaskStatus,
            });
            setIsCreateModalOpen(false);
          } catch (error) {
            console.error('Failed to create task:', error);
          }
        }}
      />
    </div>
  );
}

