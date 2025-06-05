import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import ProjectManagerDropdown, { ProjectOption } from '../components/ProjectManagerDropdown';
import ProjectTaskService, { ProjectTask, CreateTaskRequest } from '../services/ProjectTaskService';
import CreateTaskModal from '../components/CreateTaskModal';
import EditTaskModal from '../components/EditTaskModal';
import '../styles/TaskManagement.css';

// Task view types
type ViewType = 'table' | 'gantt';
type TaskTabType = 'all' | 'unassigned' | 'archived';

const TaskManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedProjectName, setSelectedProjectName] = useState<string>('');
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [viewType, setViewType] = useState<ViewType>('table');
  const [activeTab, setActiveTab] = useState<TaskTabType>('all');
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState<boolean>(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState<boolean>(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  // Handle project selection from dropdown
  const handleProjectSelect = useCallback((selected: ProjectOption | null) => {
    if (selected) {
      console.log('Project selected:', selected);
      setSelectedProjectId(selected.value);
      setSelectedProjectName(selected.label);
      setCurrentPage(0); // Reset to first page when changing projects
      setActiveTab('all'); // Reset to all tasks tab
    }
  }, []);

  // Fetch tasks when project changes or page changes
  useEffect(() => {
    const fetchTasks = async () => {
      if (!selectedProjectId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await ProjectTaskService.getAllProjectTasks(selectedProjectId, currentPage);
        setTasks(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
        setError(null);
      } catch (err: any) {
        console.error(`Error fetching tasks for project ${selectedProjectId}:`, err);
        setError('Failed to load tasks. Please try again later.');
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [selectedProjectId, currentPage]);

  // Filter tasks based on search term, status filter, and active tab
  const filteredTasks = tasks.filter(task => {
    // Text search filter
    const matchesSearch = searchTerm === '' || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'All' || 
      task.status.replace('_', ' ').toLowerCase() === statusFilter.toLowerCase();
    
    // Priority filter
    const matchesPriority = priorityFilter === 'All' || 
      task.priority.toLowerCase() === priorityFilter.toLowerCase();
    
    // Tab filter
    let matchesTab = true;
    if (activeTab === 'unassigned') {
      matchesTab = task.status === 'UNASSIGNED';
    } else if (activeTab === 'archived') {
      matchesTab = task.status === 'ARCHIVED';
    } else {
      // 'all' tab should not show archived tasks
      matchesTab = task.status !== 'ARCHIVED';
    }
    
    return matchesSearch && matchesStatus && matchesPriority && matchesTab;
  });

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  // Handle priority filter change
  const handlePriorityFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPriorityFilter(e.target.value);
  };

  // Handle tab change
  const handleTabChange = (tab: TaskTabType) => {
    setActiveTab(tab);
  };

  // Handle view type change
  const handleViewTypeChange = (type: ViewType) => {
    setViewType(type);
  };

  // Handle view task details
  const handleViewTask = (taskId: number) => {
    // Navigate to task details page
    alert(`Navigate to task details for task ${taskId}`);
  };

  // Handle edit task
  const handleEditTask = (taskId: number) => {
    setSelectedTaskId(taskId);
    setIsEditTaskModalOpen(true);
  };

  // Handle archive task
  const handleArchiveTask = async (taskId: number) => {
    if (!selectedProjectId) return;

    try {
      await ProjectTaskService.updateTaskStatus(taskId, selectedProjectId, 'ARCHIVED');
      
      // Update the local state to reflect the change
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: 'ARCHIVED' } : task
      ));
      
      alert('Task archived successfully');
    } catch (err) {
      console.error('Error archiving task:', err);
      alert('Failed to archive task. Please try again.');
    }
  };

  // Handle restore task
  const handleRestoreTask = async (taskId: number) => {
    if (!selectedProjectId) return;

    try {
      await ProjectTaskService.updateTaskStatus(taskId, selectedProjectId, 'UNASSIGNED');
      
      // Update the local state to reflect the change
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: 'UNASSIGNED' } : task
      ));
      
      alert('Task restored successfully');
    } catch (err) {
      console.error('Error restoring task:', err);
      alert('Failed to restore task. Please try again.');
    }
  };

  // Handle pagination
  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Handle add task button click
  const handleAddTask = () => {
    setIsCreateTaskModalOpen(true);
  };

  // Handle task creation
  const handleCreateTask = async (taskData: CreateTaskRequest) => {
    if (!selectedProjectId) return;

    try {
      setLoading(true);
      await ProjectTaskService.createTask(selectedProjectId, taskData);
      
      // Refresh the tasks list
      const response = await ProjectTaskService.getAllProjectTasks(selectedProjectId, currentPage);
      setTasks(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      setError(null);
      
      return Promise.resolve();
    } catch (err: any) {
      console.error('Error creating task:', err);
      return Promise.reject(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle task update success
  const handleTaskUpdated = async () => {
    if (!selectedProjectId) return;
    
    try {
      setLoading(true);
      // Refresh the tasks list
      const response = await ProjectTaskService.getAllProjectTasks(selectedProjectId, currentPage);
      setTasks(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      setError(null);
    } catch (err: any) {
      console.error('Error refreshing tasks after update:', err);
      setError('Failed to refresh tasks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Get status display class
  const getStatusClass = (status: string): string => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('todo')) return 'todo';
    if (statusLower.includes('in_progress')) return 'in_progress';
    if (statusLower.includes('completed')) return 'completed';
    if (statusLower.includes('unassigned')) return 'unassigned';
    if (statusLower.includes('archived')) return 'archived';
    return '';
  };

  // Get priority display class
  const getPriorityClass = (priority: string): string => {
    return priority.toLowerCase();
  };

  // Format status for display
  const formatStatus = (status: string): string => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Layout 
      pageTitle="Task Management" 
      userRole="project-manager"
      username={user?.name || 'Project Manager'}
    >
      <div className="task-management-container">
        <div className="task-header-container">
          <div className="project-select-label">Select a project:</div>
          <ProjectManagerDropdown 
            onProjectSelect={handleProjectSelect}
            placeholder="Select a project..."
            className="project-selector-task-management"
          />
          {selectedProjectId && (
            <button 
              className="add-task-button"
              onClick={handleAddTask}
            >
              Add a task <span className="plus-icon">+</span>
            </button>
          )}
          {selectedProjectId && (
            <div className="view-toggle-container">
              <button 
                className={`view-toggle-button ${viewType === 'table' ? 'active' : ''}`}
                onClick={() => handleViewTypeChange('table')}
              >
                Table View
              </button>
              <button 
                className={`view-toggle-button ${viewType === 'gantt' ? 'active' : ''}`}
                onClick={() => handleViewTypeChange('gantt')}
              >
                Gantt Chart
              </button>
            </div>
          )}
        </div>

        {!selectedProjectId ? (
          <div className="no-project-selected">
            <p>Please select a project to view tasks</p>
          </div>
        ) : loading ? (
          <div className="loading">Loading tasks...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : viewType === 'gantt' ? (
          <div className="gantt-view-container">
            <div className="gantt-placeholder">
              <h3>Gantt Chart View</h3>
              <p>Gantt chart visualization will be implemented in a future update.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="task-filter-bar">
              <div className="task-title">Tasks</div>
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="search-input"
                />
                <button className="search-button">
                  <i className="search-icon"></i>
                </button>
              </div>
              <div className="filter-container">
                <span className="filter-label">Filter by status:</span>
                <select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  className="filter-select"
                >
                  <option value="All">All</option>
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Unassigned">Unassigned</option>
                </select>
              </div>
              <div className="filter-container">
                <span className="filter-label">Filter by priority:</span>
                <select
                  value={priorityFilter}
                  onChange={handlePriorityFilterChange}
                  className="filter-select"
                >
                  <option value="All">All</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div className="task-type-tabs">
                <button 
                  className={`task-type-tab ${activeTab === 'all' ? 'active' : ''}`}
                  onClick={() => handleTabChange('all')}
                >
                  All Tasks
                </button>
                <button 
                  className={`task-type-tab ${activeTab === 'unassigned' ? 'active' : ''}`}
                  onClick={() => handleTabChange('unassigned')}
                >
                  Unassigned
                </button>
                <button 
                  className={`task-type-tab ${activeTab === 'archived' ? 'active' : ''}`}
                  onClick={() => handleTabChange('archived')}
                >
                  Archived
                </button>
              </div>
            </div>

            <div className="task-table-container">
              <table className="task-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Assigned To</th>
                    <th>Status</th>
                    <th>Start Date</th>
                    <th>Deadline</th>
                    <th>Priority</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>
                        No tasks found
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map(task => (
                      <tr key={task.id}>
                        <td>{task.title}</td>
                        <td>{task.assignedTo || 'Unassigned'}</td>
                        <td>
                          <span className={`task-status ${getStatusClass(task.status)}`}>
                            {formatStatus(task.status)}
                          </span>
                        </td>
                        <td>{task.startDate}</td>
                        <td>{task.dueDate}</td>
                        <td>
                          <span className={`task-priority ${getPriorityClass(task.priority)}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="action-buttons">
                          <button 
                            className="action-button action-button-view"
                            onClick={() => handleViewTask(task.id)}
                          >
                            View
                          </button>
                          <button 
                            className="action-button action-button-edit"
                            onClick={() => handleEditTask(task.id)}
                          >
                            Edit
                          </button>
                          {activeTab === 'archived' ? (
                            <button 
                              className="action-button action-button-restore"
                              onClick={() => handleRestoreTask(task.id)}
                            >
                              Restore
                            </button>
                          ) : (
                            <button 
                              className="action-button action-button-archive"
                              onClick={() => handleArchiveTask(task.id)}
                            >
                              Archive
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="pagination-button"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 0}
                >
                  «
                </button>
                <span className="pagination-info">
                  {currentPage + 1}/{totalPages}
                </span>
                <button 
                  className="pagination-button"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages - 1}
                >
                  »
                </button>
              </div>
            )}
          </>
        )}

        {/* Create Task Modal */}
        {selectedProjectId && (
          <CreateTaskModal
            isOpen={isCreateTaskModalOpen}
            onClose={() => setIsCreateTaskModalOpen(false)}
            onSubmit={handleCreateTask}
            projectId={selectedProjectId}
            projectName={selectedProjectName}
          />
        )}
        
        {/* Edit Task Modal */}
        {selectedProjectId && selectedTaskId && (
          <EditTaskModal
            isOpen={isEditTaskModalOpen}
            onClose={() => setIsEditTaskModalOpen(false)}
            onSuccess={handleTaskUpdated}
            taskId={selectedTaskId}
            projectId={selectedProjectId}
          />
        )}
      </div>
    </Layout>
  );
};

export default TaskManagement; 