import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import ProjectService, { Project, PagedResponse } from '../services/ProjectService';
import CreateProjectModal from '../components/CreateProjectModal';
import EditProjectModal from '../components/EditProjectModal';
import '../styles/ProjectManagement.css';

const ProjectManagement: React.FC = () => {
  const navigate = useNavigate();
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  // Check if user has permission to view projects
  const hasProjectViewPermission = user?.role === 'PROJECT_MANAGER' && hasPermission('PROJECT', 'view');

  // Fetch projects when search, filter, or page changes
  const fetchProjects = async () => {
    if (!hasProjectViewPermission) {
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

      const response = await ProjectService.getAllProjects(params);
      
      // If a specific project is selected, filter the results
      if (selectedProjectId) {
        const filteredProjects = response.content.filter(project => project.id === selectedProjectId);
        setProjects(filteredProjects);
      } else {
        setProjects(response.content);
      }
      
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
      
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [searchTerm, statusFilter, currentPage, pageSize, hasProjectViewPermission, selectedProjectId]);

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

  // Handle add new project
  const handleAddNewProject = () => {
    setIsCreateModalOpen(true);
  };

  // Handle project creation success
  const handleProjectCreated = () => {
    fetchProjects();
  };

  // Handle edit project
  const handleEditProject = (projectId: number) => {
    setSelectedProjectId(projectId);
    setIsEditModalOpen(true);
  };

  // Handle project update success
  const handleProjectUpdated = () => {
    fetchProjects();
  };

  // Handle archive project
  const handleArchiveProject = async (projectId: number) => {
    if (window.confirm('Are you sure you want to archive this project?')) {
      try {
        await ProjectService.archiveProject(projectId);
        // Refresh the project list after archiving
        fetchProjects();
      } catch (error) {
        console.error('Error archiving project:', error);
        alert('Failed to archive project. Please try again.');
      }
    }
  };

  // Handle view project
  const handleViewProject = (projectId: number) => {
    navigate(`/project-detail/${projectId}`);
  };

  // If user doesn't have permission, show a message
  if (!hasProjectViewPermission) {
    return (
      <Layout 
        pageTitle="Project Management" 
        userRole="project-manager"
        username={user?.name || 'Project Manager'}
      >
        <div className="permission-error">
          <h2>Access Denied</h2>
          <p>You don't have permission to manage projects.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      pageTitle="Project Management" 
      userRole="project-manager"
      username={user?.name || 'Project Manager'}
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
          
          <div className="action-container">
            <button 
              className="add-project-button"
              onClick={handleAddNewProject}
            >
              Add new project +
            </button>
            
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.length > 0 ? (
                    projects.map((project) => (
                      <tr key={project.id}>
                        <td>{project.name}</td>
                        <td>{formatDate(project.startDate)}</td>
                        <td>{formatDate(project.endDate)}</td>
                        <td>
                          <span className={`status-badge ${getStatusBadgeClass(project.status)}`}>
                            {project.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="actions-cell">
                          <button 
                            className="action-button-pm view-button" 
                            title="View Project Details"
                            onClick={() => handleViewProject(project.id)}
                          >
                            <span className="view-icon"></span>
                          </button>
                          <button 
                            className="action-button-pm edit-button" 
                            title="Edit Project"
                            onClick={() => handleEditProject(project.id)}
                          >
                            <span className="edit-icon"></span>
                          </button>
                          <button 
                            className="action-button-pm archive-button" 
                            title="Archive Project"
                            onClick={() => handleArchiveProject(project.id)}
                          >
                            <span className="archive-icon"></span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="empty-message">
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
      
      {/* Create Project Modal */}
      <CreateProjectModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleProjectCreated}
      />

      {/* Edit Project Modal */}
      {selectedProjectId && (
        <EditProjectModal 
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleProjectUpdated}
          projectId={selectedProjectId}
        />
      )}
    </Layout>
  );
};

export default ProjectManagement; 