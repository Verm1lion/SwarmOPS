import { Task, TaskStatus } from '../../types/domain';
import { Droppable } from '@hello-pangea/dnd';
import { TaskCard } from './TaskCard';

interface ColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: () => void;
}

const statusLabels: Record<TaskStatus, string> = {
  ideas: 'Ideas',
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

export function Column({ status, tasks, onTaskClick, onAddTask }: ColumnProps) {
  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);

  return (
    <div className="flex-1 min-w-0 flex flex-col bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-700">
          {statusLabels[status]} ({tasks.length})
        </h3>
      </div>
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-[200px] transition-colors ${
              snapshot.isDraggingOver ? 'bg-blue-50' : ''
            }`}
          >
            {sortedTasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onClick={() => onTaskClick(task)}
              />
            ))}
            {provided.placeholder}
            <button
              onClick={onAddTask}
              className="w-full mt-2 px-3 py-2 text-sm text-gray-600 bg-white border-2 border-dashed border-gray-300 rounded-md hover:border-gray-400 hover:text-gray-700 transition-colors"
            >
              + Add task
            </button>
          </div>
        )}
      </Droppable>
    </div>
  );
}

