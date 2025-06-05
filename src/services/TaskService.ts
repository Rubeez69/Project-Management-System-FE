import { authenticatedFetch } from './AuthService';
import { Endpoint } from '../utils/endPoint';

// Define the Task interface for upcoming tasks
export interface Task {
  id: number;
  title: string;
  assignedTo: string | null;
  status: string;
  startDate: string;
  dueDate: string;
  priority: string;
}

// Define the Kanban Task interface
export interface KanbanTask {
  id: number;
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  dueDate: string;
}

// Define project dropdown item interface
export interface ProjectDropdownItem {
  id: number;
  name: string;
}

// Define task history item interface
export interface TaskHistoryItem {
  id: number;
  message: string;
  changedAt: string;
}

// Define the API response interface
interface ApiResponse<T> {
  code: number;
  message: string | null;
  result: T;
}

// Define paged response interface
export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// Use current domain for API calls
const protocol = window.location.protocol;
const domain = window.location.hostname;
const baseUrl = `${protocol}//${domain}:8080`;

const TaskService = {
  // Fetch upcoming due tasks for developer dashboard
  getUpcomingDueTasks: async (): Promise<Task[]> => {
    try {
      const response = await authenticatedFetch(`${baseUrl}/${Endpoint.UPCOMING_DUE_TASKS}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to fetch upcoming tasks: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      const data: ApiResponse<Task[]> = await response.json();
      console.log('API Response:', data);
      
      // Return the result array from the response
      return data.result || [];
    } catch (error) {
      console.error('Error fetching upcoming due tasks:', error);
      throw error; // Propagate the error to be handled by the component
    }
  },

  // Fetch projects for dropdown
  getProjectsDropdown: async (searchTerm?: string): Promise<ProjectDropdownItem[]> => {
    try {
      const queryParams = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
      const url = `${baseUrl}/${Endpoint.MY_PROJECTS_DROPDOWN}${queryParams}`;
      
      const response = await authenticatedFetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to fetch projects: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      const data: ApiResponse<PagedResponse<ProjectDropdownItem>> = await response.json();
      console.log('Projects Dropdown API Response:', data);
      
      // Return the content array from the response
      return data.result.content || [];
    } catch (error) {
      console.error('Error fetching projects dropdown:', error);
      throw error;
    }
  },

  // Fetch tasks for a specific project
  getProjectTasks: async (projectId: number): Promise<KanbanTask[]> => {
    try {
      const url = `${baseUrl}/${Endpoint.PROJECT_TASKS}/${projectId}/my-tasks`;
      
      const response = await authenticatedFetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to fetch project tasks: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      const data: ApiResponse<KanbanTask[]> = await response.json();
      console.log('Project Tasks API Response:', data);
      
      // Return the result array from the response
      return data.result || [];
    } catch (error) {
      console.error(`Error fetching tasks for project ${projectId}:`, error);
      throw error;
    }
  },

  // Fetch recent task history
  getTaskHistory: async (): Promise<TaskHistoryItem[]> => {
    try {
      const response = await authenticatedFetch(`${baseUrl}/${Endpoint.TASK_HISTORY}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to fetch task history: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      const data: ApiResponse<TaskHistoryItem[]> = await response.json();
      console.log('Task History API Response:', data);
      
      // Return the result array from the response
      return data.result || [];
    } catch (error) {
      console.error('Error fetching task history:', error);
      throw error; // Propagate the error to be handled by the component
    }
  },

  // Fetch tasks for a specific team member in a project
  getMemberTasks: async (projectId: number, userId: number): Promise<KanbanTask[]> => {
    try {
      const url = `${baseUrl}/api/tasks/projects/${projectId}/members/${userId}/view-tasks`;
      
      const response = await authenticatedFetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to fetch member tasks: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      const data: ApiResponse<KanbanTask[]> = await response.json();
      console.log('Member Tasks API Response:', data);
      
      // Return the result array from the response
      return data.result || [];
    } catch (error) {
      console.error(`Error fetching tasks for member ${userId} in project ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Get all tasks for a project with pagination
   * @param projectId ID of the project
   * @param page Page number (0-indexed)
   * @param size Number of items per page
   * @returns Promise with tasks response
   */
  getAllProjectTasks: async (
    projectId: number,
    page: number = 0,
    size: number = 10
  ): Promise<PagedResponse<Task>> => {
    try {
      const url = `${baseUrl}/${Endpoint.PROJECT_TASKS}/${projectId}/all-tasks?page=${page}&size=${size}`;
      
      console.log('Fetching all project tasks from:', url);
      
      const response = await authenticatedFetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to fetch project tasks: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      const data: ApiResponse<PagedResponse<Task>> = await response.json();
      return data.result;
    } catch (error) {
      console.error(`Error fetching tasks for project ${projectId}:`, error);
      throw error;
    }
  },

  // Update task status
  updateTaskStatus: async (
    taskId: number, 
    projectId: number, 
    status: string
  ): Promise<boolean> => {
    try {
      const url = `${baseUrl}/${Endpoint.UPDATE_TASK_STATUS}/${taskId}/projects/${projectId}/status`;
      
      console.log(`Updating task ${taskId} status to ${status}`);
      
      const response = await authenticatedFetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to update task status: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      return true;
    } catch (error) {
      console.error(`Error updating task ${taskId} status:`, error);
      throw error;
    }
  }
};

export default TaskService; 