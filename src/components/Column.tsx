import { Droppable } from '@hello-pangea/dnd';
import { Task, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';

interface ColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const statusConfig: Record<TaskStatus, { label: string; dotColor: string }> = {
  ideas: { label: 'Ideas', dotColor: 'bg-purple-400' },
  todo: { label: 'To-Do', dotColor: 'bg-primary' },
  in_progress: { label: 'In Progress', dotColor: 'bg-amber-400' },
  done: { label: 'Done', dotColor: 'bg-green-400' }
};

export function Column({ status, tasks, onTaskClick }: ColumnProps) {
  const config = statusConfig[status];

  return (
    <div className="w-[320px] flex-shrink-0 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`}></div>
          <h3 className="font-bold text-lg">{config.label}</h3>
        </div>
        <span className="text-sm font-bold bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-md">{tasks.length}</span>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex flex-col gap-4 p-2 rounded-xl bg-slate-500/5 dark:bg-white/5 h-full transition-colors ${
              snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/20 rounded-lg' : ''
            }`}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onClick={() => onTaskClick(task)}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
