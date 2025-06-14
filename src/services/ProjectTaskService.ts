import { Endpoint } from "../utils/endPoint";
import { authenticatedFetch } from "./AuthService";

// Use current domain for API calls
const protocol = window.location.protocol;
const domain = window.location.hostname;
const baseUrl = `${protocol}//${domain}:8080`;

export interface ProjectTask {
  id: number;
  title: string;
  assignedTo: string | null;
  status: string;
  startDate: string;
  dueDate: string;
  priority: string;
}

export interface ProjectTasksResponse {
  content: ProjectTask[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ApiResponse<T> {
  code: number;
  message: string | null;
  result: T;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  startDate: string;
  dueDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  assigneeId?: number;
}

export interface UpdateTaskRequest {
  title: string;
  description: string;
  startDate: string;
  dueDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
  assigneeId?: number;
}

export interface TaskDetail {
  id: number;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
  startDate: string;
  dueDate: string;
  projectId: number;
  projectName: string;
  assignee: {
    id: number;
    name: string;
    email: string;
    role: string;
    profile: string | null;
  } | null;
  createdBy: {
    id: number;
    name: string;
    email: string;
    role: string;
    profile: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

const ProjectTaskService = {
  /**
   * Create a new task for a project
   * @param projectId ID of the project
   * @param taskData Task data to create
   * @returns Promise with created task
   */
  createTask: async (
    projectId: number,
    taskData: CreateTaskRequest
  ): Promise<ProjectTask> => {
    try {
      const url = `${baseUrl}/${Endpoint.PROJECT_TASKS}/${projectId}`;
      
      console.log('Creating new task for project:', projectId);
      
      const response = await authenticatedFetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to create task: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      const data: ApiResponse<ProjectTask> = await response.json();
      return data.result;
    } catch (error) {
      console.error(`Error creating task for project ${projectId}:`, error);
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
  ): Promise<ProjectTasksResponse> => {
    try {
      const url = `${baseUrl}/${Endpoint.PROJECT_TASKS}/${projectId}/all-tasks?page=${page}&size=${size}`;
      
      console.log('Fetching all project tasks from:', url);
      
      const response = await authenticatedFetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to fetch project tasks: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      const data: ApiResponse<ProjectTasksResponse> = await response.json();
      return data.result;
    } catch (error) {
      console.error(`Error fetching tasks for project ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Update task status
   * @param taskId ID of the task
   * @param projectId ID of the project
   * @param status New status for the task
   * @returns Promise with success boolean
   */
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
  },

  /**
   * Get task details by ID
   * @param taskId ID of the task
   * @returns Promise with task details
   */
  getTaskById: async (taskId: number): Promise<TaskDetail> => {
    try {
      const url = `${baseUrl}/${Endpoint.UPDATE_TASK_STATUS}/${taskId}`;
      
      console.log(`Fetching task details for task ID: ${taskId}`);
      
      const response = await authenticatedFetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to fetch task details: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      const data: ApiResponse<TaskDetail> = await response.json();
      return data.result;
    } catch (error) {
      console.error(`Error fetching task details for task ${taskId}:`, error);
      throw error;
    }
  },

  /**
   * Update task details
   * @param taskId ID of the task
   * @param projectId ID of the project
   * @param taskData Updated task data
   * @returns Promise with updated task
   */
  updateTask: async (
    taskId: number,
    projectId: number,
    taskData: UpdateTaskRequest
  ): Promise<TaskDetail> => {
    try {
      const url = `${baseUrl}/${Endpoint.UPDATE_TASK_STATUS}/${taskId}/projects/${projectId}/edit-task`;
      
      console.log(`Updating task ${taskId} in project ${projectId}`);
      
      const response = await authenticatedFetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to update task: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      const data: ApiResponse<TaskDetail> = await response.json();
      return data.result;
    } catch (error) {
      console.error(`Error updating task ${taskId}:`, error);
      throw error;
    }
  }
};

export default ProjectTaskService; 