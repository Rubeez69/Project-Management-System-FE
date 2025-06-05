import { Endpoint } from "../utils/endPoint";
import { authenticatedFetch } from "./AuthService";

// Use current domain for API calls
const protocol = window.location.protocol;
const domain = window.location.hostname;
const baseUrl = `${protocol}//${domain}:8080`;

export interface TeamMember {
  id: number;
  userId: number;
  profile: string | null;
  name: string;
  email: string;
  specialization: string;
}

export interface TeamMemberWithWorkload extends TeamMember {
  workload: number;
}

export interface TeamMembersResponse {
  content: TeamMember[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface TeamMembersWithWorkloadResponse {
  content: TeamMemberWithWorkload[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface SelectableMember {
  id: number;
  name: string;
  email: string;
  role: string;
  profile: string | null;
}

export interface SelectableMembersResponse {
  content: SelectableMember[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface Specialization {
  id: number;
  name: string;
}

export interface AddMemberRequest {
  userId: number;
  specializationId: number;
}

export interface ApiResponse<T> {
  code: number;
  message: string | null;
  result: T;
}

const TeamService = {
  /**
   * Get team members for the current user with pagination
   * @param projectId ID of the project
   * @param page Page number (0-indexed)
   * @param size Number of items per page
   * @returns Promise with team members response
   */
  getMyTeamMembers: async (
    projectId: number,
    page: number = 0,
    size: number = 5
  ): Promise<TeamMembersResponse> => {
    try {
      const url = `${baseUrl}/${Endpoint.TEAM_MEMBERS}/projects/${projectId}/my-team?page=${page}&size=${size}`;
      
      console.log('Fetching my team members from:', url);
      
      const response = await authenticatedFetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to fetch team members: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      const data: ApiResponse<TeamMembersResponse> = await response.json();
      return data.result;
    } catch (error) {
      console.error(`Error fetching my team members for project ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Get team members for a project with pagination
   * @param projectId ID of the project
   * @param page Page number (0-indexed)
   * @param size Number of items per page
   * @returns Promise with team members response
   */
  getProjectTeamMembers: async (
    projectId: number,
    page: number = 0,
    size: number = 5
  ): Promise<TeamMembersResponse> => {
    try {
      const url = `${baseUrl}/${Endpoint.TEAM_MEMBERS}/projects/${projectId}/my-team?page=${page}&size=${size}`;
      
      console.log('Fetching team members from:', url);
      
      const response = await authenticatedFetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to fetch team members: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      const data: ApiResponse<TeamMembersResponse> = await response.json();
      return data.result;
    } catch (error) {
      console.error(`Error fetching team members for project ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Get all members for a project with pagination (for project managers)
   * @param projectId ID of the project
   * @param page Page number (0-indexed)
   * @param size Number of items per page
   * @returns Promise with team members response
   */
  getProjectMemberList: async (
    projectId: number,
    page: number = 0,
    size: number = 5
  ): Promise<TeamMembersResponse> => {
    try {
      const url = `${baseUrl}/${Endpoint.PROJECT_MEMBER_LIST}/${projectId}/member-list?page=${page}&size=${size}`;
      
      console.log('Fetching project member list from:', url);
      
      const response = await authenticatedFetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to fetch project members: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      const data: ApiResponse<TeamMembersResponse> = await response.json();
      return data.result;
    } catch (error) {
      console.error(`Error fetching project members for project ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Get selectable members for a project (users who are not already members)
   * @param projectId ID of the project
   * @param page Page number (0-indexed)
   * @param size Number of items per page
   * @returns Promise with selectable members response
   */
  getSelectableMembers: async (
    projectId: number,
    page: number = 0,
    size: number = 6
  ): Promise<SelectableMembersResponse> => {
    try {
      const url = `${baseUrl}/${Endpoint.SELECT_MEMBERS}/${projectId}/select-member?page=${page}&size=${size}`;
      
      console.log('Fetching selectable members from:', url);
      
      const response = await authenticatedFetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to fetch selectable members: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      const data: ApiResponse<SelectableMembersResponse> = await response.json();
      return data.result;
    } catch (error) {
      console.error(`Error fetching selectable members for project ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Get all available specializations
   * @returns Promise with specializations array
   */
  getSpecializations: async (): Promise<Specialization[]> => {
    try {
      const url = `${baseUrl}/${Endpoint.SPECIALIZATIONS}`;
      
      console.log('Fetching specializations from:', url);
      
      const response = await authenticatedFetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to fetch specializations: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      const data: ApiResponse<Specialization[]> = await response.json();
      return data.result;
    } catch (error) {
      console.error('Error fetching specializations:', error);
      throw error;
    }
  },

  /**
   * Add members to a project
   * @param projectId ID of the project
   * @param members Array of member requests with user ID and specialization ID
   * @returns Promise with success boolean
   */
  addTeamMembers: async (
    projectId: number,
    members: AddMemberRequest[]
  ): Promise<boolean> => {
    try {
      const url = `${baseUrl}/${Endpoint.ADD_TEAM_MEMBERS}/${projectId}/add`;
      
      console.log('Adding team members to project:', projectId);
      
      const response = await authenticatedFetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(members),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to add team members: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      return true;
    } catch (error) {
      console.error(`Error adding team members to project ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Get team members with workload information for a project
   * @param projectId ID of the project
   * @param page Page number (0-indexed)
   * @param size Number of items per page
   * @returns Promise with team members with workload response
   */
  getTeamMembersWithWorkload: async (
    projectId: number,
    page: number = 0,
    size: number = 5
  ): Promise<TeamMembersWithWorkloadResponse> => {
    try {
      const url = `${baseUrl}/${Endpoint.TEAM_MEMBERS}/projects/${projectId}/members-with-workload?page=${page}&size=${size}`;
      
      console.log('Fetching team members with workload from:', url);
      
      const response = await authenticatedFetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to fetch team members with workload: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      const data: ApiResponse<TeamMembersWithWorkloadResponse> = await response.json();
      return data.result;
    } catch (error) {
      console.error(`Error fetching team members with workload for project ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Remove a team member
   * @param memberId ID of the team member to remove
   * @returns Promise with success boolean
   */
  removeTeamMember: async (memberId: number): Promise<boolean> => {
    try {
      const url = `${baseUrl}/${Endpoint.TEAM_MEMBERS}/${memberId}`;
      
      console.log('Removing team member with ID:', memberId);
      
      const response = await authenticatedFetch(url, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to remove team member: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      return true;
    } catch (error) {
      console.error(`Error removing team member with ID ${memberId}:`, error);
      throw error;
    }
  }
};

export default TeamService; 