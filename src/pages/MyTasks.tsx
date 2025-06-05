import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';
import TaskService, { KanbanTask } from '../services/TaskService';
import { DndContext, DragEndEvent, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import '../styles/MyTasks.css';
import TaskCard from '../components/kanban/TaskCard';
import KanbanColumn from '../components/kanban/KanbanColumn';
import ProjectSelector, { ProjectOption } from '../components/ProjectSelector';

const MyTasks: React.FC = () => {
  const { user } = useAuth();
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);

  // Define the task status columns
  const columns: { id: string; title: string }[] = [
    { id: 'TODO', title: 'TODO' },
    { id: 'IN_PROGRESS', title: 'IN PROGRESS' },
    { id: 'COMPLETED', title: 'COMPLETED' }
  ];

  // Setup DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Handle project selection
  const handleProjectSelect = useCallback((selected: ProjectOption | null) => {
    if (selected) {
      console.log('Project selected:', selected);
      setSelectedProjectId(selected.value);
    }
  }, []);

  // Load tasks for selected project
  useEffect(() => {
    const fetchTasks = async () => {
      if (!selectedProjectId) return;

      try {
        setLoading(true);
        const taskData = await TaskService.getProjectTasks(selectedProjectId);
        setTasks(taskData);
        setError(null);
      } catch (err: any) {
        console.error(`Error fetching tasks for project ${selectedProjectId}:`, err);
        if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError(err.message || 'Failed to load tasks');
        }
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [selectedProjectId]);

  // Get tasks for a specific column
  const getTasksByStatus = useCallback((status: string) => {
    return tasks.filter(task => task.status === status);
  }, [tasks]);

  // Handle drag end event
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    // If the item was dropped in a different container
    if (active.data.current?.status !== over.id) {
      // Get the task that was dragged
      const taskId = active.id as number;
      const task = tasks.find(t => t.id === taskId);
      
      if (!task || !selectedProjectId) return;
      
      // The new status is the id of the container it was dropped in
      const newStatus = over.id as 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
      
      try {
        // Update the task status via API
        await TaskService.updateTaskStatus(taskId, selectedProjectId, newStatus);
        
        // Update the local tasks state
        setTasks(prevTasks => 
          prevTasks.map(t => 
            t.id === taskId ? { ...t, status: newStatus } : t
          )
        );
      } catch (err: any) {
        console.error('Error updating task status:', err);
        // Show error but don't update UI
        if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError(err.message || 'Failed to update task status');
        }
        // Error toast or notification could be added here
      }
    }
    
    setActiveTask(null);
  };

  // Handle drag start
  const handleDragStart = (event: any) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  return (
    <Layout
      pageTitle="My Tasks"
      userRole={user?.role || 'user'}
      username={user?.name || 'User'}
    >
      <div className="tasks-container">
        <div className="project-selector-container">
          <ProjectSelector 
            onProjectSelect={handleProjectSelect}
            label="Select a project:"
            className="project-selector-tasks"
            defaultProjectId={selectedProjectId || undefined}
          />
        </div>

        {loading && !selectedProjectId ? (
          <div className="loading">Loading projects...</div>
        ) : loading ? (
          <div className="loading">Loading tasks...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <>
            <div className="tasks-filter-bar">
              <div className="tasks-title">My Tasks - Kanban Board</div>
            </div>

            <DndContext 
              sensors={sensors} 
              onDragEnd={handleDragEnd}
              onDragStart={handleDragStart}
            >
              <div className="kanban-board">
                {columns.map(column => (
                  <KanbanColumn 
                    key={column.id} 
                    id={column.id} 
                    title={column.title}
                    tasks={getTasksByStatus(column.id)}
                  />
                ))}
              </div>
              
              <DragOverlay>
                {activeTask ? (
                  <TaskCard 
                    task={activeTask} 
                    isDragging={true} 
                  />
                ) : null}
              </DragOverlay>
            </DndContext>
          </>
        )}
      </div>
    </Layout>
  );
};

export default MyTasks; 