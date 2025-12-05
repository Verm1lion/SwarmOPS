import { Task, TaskPriority } from '../../types/domain';
import { Draggable } from '@hello-pangea/dnd';

interface TaskCardProps {
  task: Task;
  index: number;
  onClick: () => void;
}

const priorityColors: Record<TaskPriority, string> = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

const priorityLabels: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export function TaskCard({ task, index, onClick }: TaskCardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return null;
    }
  };

  const dueDate = formatDate(task.dueDate);

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`bg-white rounded-lg p-3 mb-2 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow ${
            snapshot.isDragging ? 'shadow-lg rotate-2' : ''
          }`}
        >
          <div className="font-medium text-gray-900 mb-1 line-clamp-2">{task.title}</div>
          {dueDate && (
            <div className="text-xs text-gray-500 mb-2">Due: {dueDate}</div>
          )}
          <div className="flex items-center justify-between">
            <span className={`text-xs px-2 py-1 rounded ${priorityColors[task.priority]}`}>
              {priorityLabels[task.priority]}
            </span>
          </div>
        </div>
      )}
    </Draggable>
  );
}

