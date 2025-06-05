import React, { useEffect, useState } from 'react';
import TaskService, { Task } from '../services/TaskService';
import '../styles/UpcomingTasks.css';

// Helper function to format date as DD/MM/YYYY
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
};

// Helper function to get status badge class
const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case 'TODO':
      return 'todo';
    case 'IN_PROGRESS':
      return 'in-progress';
    case 'DONE':
    case 'COMPLETED':
      return 'completed';
    default:
      // For other statuses, convert to kebab-case
      return status.toLowerCase().replace(/[\s_]/g, '-');
  }
};

// Helper function to format status display
const formatStatus = (status: string): string => {
  // Return the status as is - don't convert TODO to In Progress
  switch (status) {
    case 'TODO':
      return 'TODO';
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'DONE':
    case 'COMPLETED':
      return 'Completed';
    default:
      return status;
  }
};

const UpcomingTasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        console.log('Fetching upcoming tasks...');
        // Try to fetch tasks from API
        const upcomingTasks = await TaskService.getUpcomingDueTasks();
        console.log('Fetched tasks:', upcomingTasks);
        
        // Set tasks from API response, even if empty
        setTasks(upcomingTasks);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching upcoming tasks:', err);
        
        // Extract error message from backend response if available
        if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError('Failed to load upcoming tasks');
        }
        
        // Don't use sample data on error, just set empty array
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  console.log('Current tasks state:', tasks);

  if (loading) {
    return <div className="loading">Loading upcoming tasks...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="upcoming-tasks-container">
      <div className="upcoming-tasks-header">
        <div className="task-name-col">Task Name</div>
        <div className="due-date-col">Due Date</div>
        <div className="status-col">Status</div>
        <div className="actions-col"></div>
      </div>
      
      {tasks.length > 0 ? (
        tasks.map((task) => (
          <div className="upcoming-task-row" key={task.id}>
            <div className="task-name-col">{task.title}</div>
            <div className="due-date-col">{formatDate(task.dueDate)}</div>
            <div className="status-col">
              <span className={`status-badge ${getStatusBadgeClass(task.status)}`}>
                {formatStatus(task.status)}
              </span>
            </div>
            <div className="actions-col">
              <button className="view-details-btn">View details</button>
            </div>
          </div>
        ))
      ) : (
        <div className="no-tasks-message">
          No upcoming tasks due. You're all caught up!
        </div>
      )}
    </div>
  );
};

export default UpcomingTasks; 