import { authenticatedFetch } from './AuthService';
import { Endpoint } from '../utils/endPoint';

// Types for project data
export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string | null;
  status: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
  teamMembersCount: number;
  tasksCount: number;
  archived: boolean;
}

export interface PagedResponse<T> {
  content: T[];
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

export interface ProjectQueryParams {
  name?: string;
  status?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface ProjectCreateRequest {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  status?: string;
}

export interface ProjectUpdateRequest {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export interface ProjectDetail {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string | null;
  status: string;
  teamMembers: TeamMember[];
}

export interface TeamMember {
  id: number;
  userId: number;
  profile: string | null;
  name: string;
  email: string;
  specialization: string;
}

// Project dropdown item interface
export interface ProjectDropdownItem {
  id: number;
  name: string;
}

const baseUrl = `${window.location.protocol}//${window.location.hostname}:8080`;

const ProjectService = {
  /**
   * Fetch projects that the current user is a member of
   * @param params Query parameters for filtering, pagination, and sorting
   * @returns Promise with paged project data
   */
  getMyProjects: async (params: ProjectQueryParams = {}): Promise<PagedResponse<Project>> => {
    try {
      // Build query string from params
      const queryParams = new URLSearchParams();
      
      if (params.name) queryParams.append('name', params.name);
      if (params.status) queryParams.append('status', params.status);
      if (params.page !== undefined) queryParams.append('page', params.page.toString());
      if (params.size !== undefined) queryParams.append('size', params.size.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
      
      const queryString = queryParams.toString();
      const url = `${baseUrl}/${Endpoint.MY_PROJECTS}${queryString ? `?${queryString}` : ''}`;
      
      console.log('Fetching projects from:', url);
      
      const response = await authenticatedFetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to fetch projects: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      const data: ApiResponse<PagedResponse<Project>> = await response.json();
      console.log('Projects API Response:', data);
      
      return data.result;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  /**
   * Fetch all projects for project management (PM only)
   * @param params Query parameters for filtering, pagination, and sorting
   * @returns Promise with paged project data
   */
  getAllProjects: async (params: ProjectQueryParams = {}): Promise<PagedResponse<Project>> => {
    try {
      // Build query string from params
      const queryParams = new URLSearchParams();
      
      if (params.name) queryParams.append('name', params.name);
      if (params.status) queryParams.append('status', params.status);
      if (params.page !== undefined) queryParams.append('page', params.page.toString());
      if (params.size !== undefined) queryParams.append('size', params.size.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);
      
      const queryString = queryParams.toString();
      const url = `${baseUrl}/${Endpoint.PROJECTS}${queryString ? `?${queryString}` : ''}`;
      
      console.log('Fetching all projects from:', url);
      
      const response = await authenticatedFetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to fetch projects: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      const data: ApiResponse<PagedResponse<Project>> = await response.json();
      console.log('All Projects API Response:', data);
      
      return data.result;
    } catch (error) {
      console.error('Error fetching all projects:', error);
      throw error;
    }
  },

  /**
   * Create a new project
   * @param projectData Project data to create
   * @returns Promise with created project data
   */
  createProject: async (projectData: ProjectCreateRequest): Promise<Project> => {
    try {
      const url = `${baseUrl}/${Endpoint.PROJECTS}`;
      
      console.log('Creating project with data:', projectData);
      
      const response = await authenticatedFetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to create project: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      const data: ApiResponse<Project> = await response.json();
      console.log('Create Project API Response:', data);
      
      return data.result;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  /**
   * Get project details by ID
   * @param projectId ID of the project to fetch
   * @returns Promise with project detail data
   */
  getProjectDetail: async (projectId: number): Promise<ProjectDetail> => {
    try {
      const url = `${baseUrl}/${Endpoint.PROJECTS}/${projectId}/detail`;
      
      console.log(`Fetching project details for project ${projectId}`);
      
      const response = await authenticatedFetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to fetch project details: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      const data: ApiResponse<ProjectDetail> = await response.json();
      console.log('Project Detail API Response:', data);
      
      return data.result;
    } catch (error) {
      console.error(`Error fetching project details for project ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Update an existing project
   * @param projectId ID of the project to update
   * @param projectData Project data to update
   * @returns Promise with updated project data
   */
  updateProject: async (projectId: number, projectData: ProjectUpdateRequest): Promise<Project> => {
    try {
      const url = `${baseUrl}/${Endpoint.PROJECTS}/${projectId}`;
      
      console.log(`Updating project ${projectId} with data:`, projectData);
      
      const response = await authenticatedFetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to update project: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      const data: ApiResponse<Project> = await response.json();
      console.log('Update Project API Response:', data);
      
      return data.result;
    } catch (error) {
      console.error(`Error updating project ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Archive a project
   * @param projectId ID of the project to archive
   * @returns Promise with boolean indicating success
   */
  archiveProject: async (projectId: number): Promise<boolean> => {
    try {
      const url = `${baseUrl}/${Endpoint.PROJECTS}/${projectId}/archive`;
      
      console.log(`Archiving project ${projectId}`);
      
      const response = await authenticatedFetch(url, {
        method: 'PATCH',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to archive project: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      console.log(`Project ${projectId} archived successfully`);
      return true;
    } catch (error) {
      console.error(`Error archiving project ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Get projects dropdown for project managers
   * @param searchTerm Optional search term to filter projects by name
   * @returns Promise with project dropdown items
   */
  getProjectsDropdown: async (searchTerm?: string): Promise<ProjectDropdownItem[]> => {
    try {
      const queryParams = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
      const url = `${baseUrl}/${Endpoint.PM_PROJECTS_DROPDOWN}${queryParams}`;
      
      console.log('Fetching projects dropdown from:', url);
      
      const response = await authenticatedFetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to fetch projects dropdown: ${response.status}`;
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
};

export default ProjectService; 