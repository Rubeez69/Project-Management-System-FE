import React, { useEffect, useState } from 'react';
import TaskService, { TaskHistoryItem } from '../services/TaskService';
import '../styles/RecentActivities.css';

// Helper function to format date as DD/MM/YYYY HH:MM
const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

const RecentActivities: React.FC = () => {
  const [activities, setActivities] = useState<TaskHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        console.log('Fetching recent activities...');
        
        const taskHistory = await TaskService.getTaskHistory();
        console.log('Fetched activities:', taskHistory);
        
        setActivities(taskHistory);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching recent activities:', err);
        
        if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError('Failed to load recent activities');
        }
        
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) {
    return <div className="loading">Loading recent activities...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="recent-activities-container">
      <div className="activities-header">
        <h4>Team Activity Log</h4>
        <span className="activities-count">{activities.length} activities</span>
      </div>
      <div className="recent-activities-list">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div className="activity-item" key={activity.id}>
              <div className="activity-message">{activity.message}</div>
              <div className="activity-time">{formatDateTime(activity.changedAt)}</div>
            </div>
          ))
        ) : (
          <div className="no-activities-message">
            No recent activities to display.
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivities; 