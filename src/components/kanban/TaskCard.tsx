import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { KanbanTask } from '../../services/TaskService';

interface TaskCardProps {
  task: KanbanTask;
  isDragging?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, isDragging = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      status: task.status,
      task: task,
    },
  });

  // Format date to DD/MM/YYYY
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  // Get priority class for styling
  const getPriorityClass = (): string => {
    switch (task.priority) {
      case 'HIGH':
        return 'high-priority';
      case 'MEDIUM':
        return 'medium-priority';
      case 'LOW':
        return 'low-priority';
      default:
        return '';
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card ${getPriorityClass()}`}
      {...attributes}
      {...listeners}
    >
      <div className="task-header">
        <h3 className="task-title-kb">{task.title}</h3>
      </div>
      <div className="task-description">{task.description}</div>
      <div className="task-footer">
        <div className="task-due-date">
          <span className="due-date-label">Due date:</span> {formatDate(task.dueDate)}
        </div>
      </div>
    </div>
  );
};

export default TaskCard; 