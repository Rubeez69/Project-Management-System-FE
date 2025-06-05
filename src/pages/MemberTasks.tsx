import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import Layout from '../components/Layout';
import TaskCard from '../components/kanban/TaskCard';
import KanbanColumn from '../components/kanban/KanbanColumn';
import { useAuth } from '../hooks/useAuth';
import TaskService, { KanbanTask } from '../services/TaskService';
import '../styles/MyTasks.css';

const MemberTasks: React.FC = () => {
  const params = useParams<{projectId: string; userId: string; memberName?: string}>();
  const { projectId, userId, memberName } = params;
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [memberInfo, setMemberInfo] = useState<{ name: string }>({ name: memberName || 'Team Member' });

  // Define the task status columns
  const columns: { id: string; title: string }[] = [
    { id: 'TODO', title: 'To Do' },
    { id: 'IN_PROGRESS', title: 'In Progress' },
    { id: 'COMPLETED', title: 'Completed' }
  ];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const fetchMemberTasks = async () => {
      if (!projectId || !userId) {
        setError('Missing required parameters');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await TaskService.getMemberTasks(parseInt(projectId, 10), parseInt(userId, 10));
        setTasks(response);
        setError(null);
      } catch (err) {
        console.error('Error fetching member tasks:', err);
        setError('Failed to load tasks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMemberTasks();
  }, [projectId, userId]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    // Extract task ID and target status from the draggable and droppable IDs
    const taskId = Number(active.id);
    const targetStatus = String(over.id);
    
    console.log(`Drag end - Task ID: ${taskId}, Target column: ${targetStatus}`);
    
    // Find the task that was dragged
    const draggedTask = tasks.find(task => task.id === taskId);
    
    if (!draggedTask || draggedTask.status === targetStatus || !projectId) {
      return; // No change needed
    }
    
    try {
      console.log(`Updating task ${taskId} status from ${draggedTask.status} to ${targetStatus}`);
      
      // Update the task status in the backend with the expected format
      await TaskService.updateTaskStatus(
        taskId, 
        parseInt(projectId, 10), 
        targetStatus as 'TODO' | 'IN_PROGRESS' | 'COMPLETED'
      );
      
      // Update the local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status: targetStatus as 'TODO' | 'IN_PROGRESS' | 'COMPLETED' } : task
        )
      );
    } catch (err) {
      console.error('Error updating task status:', err);
      alert('Failed to update task status. Please try again.');
    }
  };

  // Get tasks for a specific column
  const getTasksByStatus = (status: string): KanbanTask[] => {
    return tasks.filter(task => task.status === status);
  };

  // Handle back button click to go to project detail page
  const handleBackToProject = () => {
    if (projectId) {
      navigate(`/project-detail/${projectId}`);
    }
  };

  if (loading) {
    return (
      <Layout 
        pageTitle={`${memberInfo.name}'s Tasks`}
        userRole="project-manager"
        username={user?.name || 'Project Manager'}
      >
        <div className="loading">Loading tasks...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout 
        pageTitle={`${memberInfo.name}'s Tasks`}
        userRole="project-manager"
        username={user?.name || 'Project Manager'}
      >
        <div className="error">{error}</div>
      </Layout>
    );
  }

  return (
    <Layout 
      pageTitle={`${memberInfo.name}'s Tasks`}
      userRole="project-manager"
      username={user?.name || 'Project Manager'}
    >
      <div className="tasks-container">
        <div className="back-button-container">
          <button 
            className="back-button" 
            onClick={handleBackToProject}
          >
            <span style={{ marginRight: '6px' }}>&larr;</span> Back to Project Details
          </button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
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
        </DndContext>
      </div>
    </Layout>
  );
};

export default MemberTasks; 