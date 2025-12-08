import { Draggable } from '@hello-pangea/dnd';
import { Task, TaskPriority } from '../types';
import { usePlanner } from '../hooks/usePlanner';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  index: number;
  onClick: () => void;
}

const priorityColors: Record<TaskPriority, string> = {
  low: 'bg-green-500/20 text-green-700 dark:bg-green-500/30 dark:text-green-300',
  medium: 'bg-yellow-500/20 text-yellow-700 dark:bg-yellow-500/30 dark:text-yellow-300',
  high: 'bg-red-500/20 text-red-700 dark:bg-red-500/30 dark:text-red-300'
};

const priorityLabels: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High'
};

export function TaskCard({ task, index, onClick }: TaskCardProps) {
  const { members, visibleMembers, comments } = usePlanner();
  // Use visibleMembers to find assignee, but fallback to members if assignee is admin (for display purposes)
  const assignee = visibleMembers.find(m => m.id === task.assigneeMemberId) || 
                   members.find(m => m.id === task.assigneeMemberId);
  const taskComments = comments.filter(c => c.taskId === task.id);
  const commentCount = taskComments.length;

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`rounded-xl border border-border-light dark:border-border-dark bg-glass-light dark:bg-glass-dark backdrop-blur-xl shadow-lg hover:shadow-deep transition-all duration-300 hover:-translate-y-1 cursor-pointer p-4 space-y-3 ${
            snapshot.isDragging ? 'shadow-deep-lg rotate-2' : ''
          }`}
        >
          <h4 className="font-bold">{task.title}</h4>

          {task.priority !== 'medium' && (
            <div className="flex items-center gap-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>
                {priorityLabels[task.priority]}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-text-light-secondary dark:text-text-dark-secondary">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base">chat_bubble_outline</span>
              <span>{commentCount}</span>
            </div>
            {task.dueDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(task.dueDate), 'MMM d')}</span>
              </div>
            )}
            {assignee && (
              <div
                className="size-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                style={{ backgroundColor: assignee.avatarColor }}
              >
                {assignee.displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
