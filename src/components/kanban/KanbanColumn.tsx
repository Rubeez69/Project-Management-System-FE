import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanTask } from '../../services/TaskService';
import TaskCard from './TaskCard';

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: KanbanTask[];
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ id, title, tasks }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const taskIds = tasks.map(task => task.id);

  return (
    <div className={`kanban-column ${isOver ? 'is-over' : ''}`}>
      <div className="column-header">
        <h3 className="column-title">{title}</h3>
        <div className="task-count">{tasks.length}</div>
      </div>
      <div
        ref={setNodeRef}
        className="column-content"
      >
        <SortableContext
          items={taskIds}
          strategy={verticalListSortingStrategy}
        >
          {tasks.length > 0 ? (
            tasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))
          ) : (
            <div className="empty-column">No tasks</div>
          )}
        </SortableContext>
      </div>
    </div>
  );
};

export default KanbanColumn; 