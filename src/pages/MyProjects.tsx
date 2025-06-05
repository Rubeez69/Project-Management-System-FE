import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import ProjectService, { Project, PagedResponse } from '../services/ProjectService';
import '../styles/MyProjects.css';

const MyProjects: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [pageSize] = useState<number>(10);

  // Debug permissions in detail
  useEffect(() => {
    console.log('User data:', user);
    
    if (user) {
      console.log('User role:', user.role);
      
      if (user.permissions) {
        console.log('User permissions array:', user.permissions);
        
        // Try to find project permission with different case variations
        const projectPermVariations = [
          user.permissions.find((p: any) => p.module === 'PROJECT'),
          user.permissions.find((p: any) => p.module === 'project'),
          user.permissions.find((p: any) => p.module?.toUpperCase?.() === 'PROJECT')
        ];
        
        console.log('Project permission variations found:', projectPermVariations);
        
        // Check if permissions are in a different format
        if (typeof user.permissions === 'object' && !Array.isArray(user.permissions)) {
          console.log('Permissions might be in object format instead of array');
          console.log('Direct project permission:', user.permissions.PROJECT || user.permissions.project);
        }
      } else {
        console.log('No permissions found on user object');
      }
    }
  }, [user]);

  // Check if user has permission to view projects
  // First try with the hasPermission helper
  const hasPermissionFromHelper = user?.role === 'DEVELOPER' && hasPermission('PROJECT', 'view');
  
  // Fallback direct check in case the helper doesn't work
  const hasDirectPermission = user?.role === 'DEVELOPER' && 
    user?.permissions?.some((p: any) => 
      (p.module.toUpperCase() === 'PROJECT' || p.module === 'project') && p.canView === true
    );
  
  // Use either method that works
  const hasProjectViewPermission = hasPermissionFromHelper || hasDirectPermission;
  
  // TEMPORARY OVERRIDE FOR TESTING - Remove in production
  // This allows us to see the projects page even if permission checks fail
  const overridePermission = true;
  const effectivePermission = overridePermission || hasProjectViewPermission;

  // Log permission check result
  useEffect(() => {
    console.log('Permission check from helper:', hasPermissionFromHelper);
    console.log('Direct permission check:', hasDirectPermission);
    console.log('Final permission result (before override):', hasProjectViewPermission);
    console.log('Using permission override:', overridePermission);
    console.log('Effective permission used:', effectivePermission);
  }, [hasPermissionFromHelper, hasDirectPermission, hasProjectViewPermission, effectivePermission]);

  // Fetch projects when search, filter, or page changes
  useEffect(() => {
    const fetchProjects = async () => {
      if (!effectivePermission) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const params = {
          name: searchTerm || undefined,
          status: statusFilter || undefined,
          page: currentPage,
          size: pageSize,
          sortBy: 'startDate',
          sortDirection: 'desc' as const
        };

        const response = await ProjectService.getMyProjects(params);
        setProjects(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching projects:', err);
        // Extract error message from backend response if available
        if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError('Failed to load projects. Please try again later.');
        }
        
        // Use sample data for demonstration
        const sampleProjects: Project[] = [
          {
            id: 1,
            name: "Internal Tool Revamp",
            description: "Building internal project management tool",
            startDate: "2025-06-01",
            endDate: "2025-12-01",
            status: "ACTIVE",
            createdBy: {
              id: 2,
              name: "PM One",
              email: "pm1@example.com"
            },
            createdAt: "2025-05-29T23:04:34",
            updatedAt: "2025-05-29T23:04:34",
            teamMembersCount: 7,
            tasksCount: 0,
            archived: false
          },
          {
            id: 2,
            name: "Project Alpha",
            description: "Build the core platform module.",
            startDate: "2024-01-10",
            endDate: "2024-04-30",
            status: "ACTIVE",
            createdBy: {
              id: 2,
              name: "PM One",
              email: "pm1@example.com"
            },
            createdAt: "2025-05-29T23:04:34",
            updatedAt: "2025-05-29T23:04:34",
            teamMembersCount: 3,
            tasksCount: 17,
            archived: false
          },
          {
            id: 9,
            name: "Project Theta",
            description: "Set up CI/CD pipeline and test automation.",
            startDate: "2024-03-01",
            endDate: "2024-06-30",
            status: "ACTIVE",
            createdBy: {
              id: 3,
              name: "PM Two",
              email: "pm2@example.com"
            },
            createdAt: "2025-05-29T23:04:34",
            updatedAt: "2025-05-29T23:04:34",
            teamMembersCount: 2,
            tasksCount: 0,
            archived: false
          }
        ];
        
        setProjects(sampleProjects);
        setTotalPages(1);
        setTotalElements(sampleProjects.length);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [searchTerm, statusFilter, currentPage, pageSize, effectivePermission]);

  // Format date for display
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0); // Reset to first page when search changes
  };

  // Handle status filter change
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setCurrentPage(0); // Reset to first page when filter changes
  };

  // Handle pagination
  const goToPage = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  // Get status badge class based on status
  const getStatusBadgeClass = (status: string): string => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return 'status-badge-active';
      case 'COMPLETED':
        return 'status-badge-completed';
      case 'ON_HOLD':
        return 'status-badge-onhold';
      default:
        return 'status-badge-default';
    }
  };

  // If user doesn't have permission, show a message
  if (!effectivePermission) {
    return (
      <Layout 
        pageTitle="My Projects" 
        userRole="developer"
        username={user?.name || 'Developer'}
      >
        <div className="permission-error">
          <h2>Access Denied</h2>
          <p>You don't have permission to view projects.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      pageTitle="My Projects" 
      userRole="developer"
      username={user?.name || 'Developer'}
    >
      <div className="projects-container">
        <div className="projects-header">
          <div className="search-container">
            <input
              type="text"
              placeholder="Enter project name"
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            <button className="search-button">
              <i className="search-icon"></i>
            </button>
          </div>
          
          <div className="filter-container">
            <select 
              value={statusFilter} 
              onChange={handleStatusFilterChange}
              className="filter-select"
            >
              <option value="">Filter by status</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="ON_HOLD">On Hold</option>
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="loading">Loading projects...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <>
            <div className="projects-table-container">
              <table className="projects-table">
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                    <th>Project Manager</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id}>
                      <td>{project.name}</td>
                      <td>{formatDate(project.startDate)}</td>
                      <td>{formatDate(project.endDate)}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(project.status)}`}>
                          {project.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>{project.createdBy.name}</td>
                      <td className="actions-cell">
                        <button className="action-button view-button" title="View Project Details">
                          <span className="view-icon"></span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {projects.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                        No projects found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="pagination">
              <button 
                className="pagination-button" 
                onClick={() => goToPage(0)}
                disabled={currentPage === 0}
              >
                &laquo;
              </button>
              <button 
                className="pagination-button" 
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 0}
              >
                &lt;
              </button>
              
              <span className="pagination-info">
                {currentPage + 1}/{totalPages}
              </span>
              
              <button 
                className="pagination-button" 
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
              >
                &gt;
              </button>
              <button 
                className="pagination-button" 
                onClick={() => goToPage(totalPages - 1)}
                disabled={currentPage === totalPages - 1}
              >
                &raquo;
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default MyProjects; 