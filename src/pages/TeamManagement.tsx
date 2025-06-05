import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import ProjectManagerDropdown, { ProjectOption } from '../components/ProjectManagerDropdown';
import TeamService, { TeamMember } from '../services/TeamService';
import AddMemberModal from '../components/AddMemberModal';
import '../styles/TeamManagement.css';

const TeamManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedProjectName, setSelectedProjectName] = useState<string>('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [specialization, setSpecialization] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState<boolean>(false);

  // Handle project selection from dropdown
  const handleProjectSelect = useCallback((selected: ProjectOption | null) => {
    if (selected) {
      console.log('Project selected:', selected);
      setSelectedProjectId(selected.value);
      setSelectedProjectName(selected.label);
      setCurrentPage(0); // Reset to first page when changing projects
    }
  }, []);

  // Fetch team members when project changes
  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!selectedProjectId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await TeamService.getProjectMemberList(selectedProjectId, currentPage);
        setTeamMembers(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
        setError(null);
      } catch (err: any) {
        console.error(`Error fetching team members for project ${selectedProjectId}:`, err);
        setError('Failed to load team members. Please try again later.');
        setTeamMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, [selectedProjectId, currentPage]);

  // Filter team members by search term and specialization
  const filteredTeamMembers = teamMembers.filter(member => {
    const matchesSearch = searchTerm === '' || 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialization = specialization === 'All' || 
      member.specialization === specialization;
    
    return matchesSearch && matchesSpecialization;
  });

  // Get unique specializations for the filter dropdown
  const specializations = ['All', ...Array.from(new Set(teamMembers.map(member => member.specialization)))];

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle specialization filter change
  const handleSpecializationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSpecialization(e.target.value);
  };

  // Handle view member tasks
  const handleViewMemberTasks = (member: TeamMember) => {
    if (selectedProjectId) {
      navigate(`/project/${selectedProjectId}/member/${member.userId}/tasks/${encodeURIComponent(member.name)}`);
    }
  };

  // Handle remove member (this would need to be implemented with an API call)
  const handleRemoveMember = async (member: TeamMember) => {
    if (!window.confirm(`Are you sure you want to remove ${member.name} from this project?`)) {
      return;
    }
    
    try {
      setLoading(true);
      await TeamService.removeTeamMember(member.id);
      
      // Remove the member from the local state
      setTeamMembers(prevMembers => prevMembers.filter(m => m.id !== member.id));
      
      // If we removed the last member on the current page and it's not the first page,
      // go back one page
      if (filteredTeamMembers.length === 1 && currentPage > 0) {
        setCurrentPage(currentPage - 1);
      } else {
        // Otherwise just refresh the current page
        if (selectedProjectId) {
          const response = await TeamService.getProjectMemberList(selectedProjectId, currentPage);
          setTeamMembers(response.content);
          setTotalPages(response.totalPages);
          setTotalElements(response.totalElements);
        }
      }
      
      setError(null);
    } catch (err: any) {
      console.error(`Error removing team member:`, err);
      setError(err.message || 'Failed to remove team member. Please try again later.');
    } finally {
      setLoading(false);
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

  // Handle add member button click
  const handleAddMember = () => {
    setIsAddMemberModalOpen(true);
  };

  // Handle member added successfully
  const handleMemberAdded = () => {
    // Refresh the team members list
    if (selectedProjectId) {
      const fetchTeamMembers = async () => {
        try {
          setLoading(true);
          const response = await TeamService.getProjectMemberList(selectedProjectId, currentPage);
          setTeamMembers(response.content);
          setTotalPages(response.totalPages);
          setTotalElements(response.totalElements);
        } catch (err) {
          console.error('Error refreshing team members:', err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchTeamMembers();
    }
  };

  return (
    <Layout 
      pageTitle="Team Management" 
      userRole="project-manager"
      username={user?.name || 'Project Manager'}
    >
      <div className="team-management-container">
        <div className="project-selector-container">
          <div className="project-select-label">Select a project:</div>
          <ProjectManagerDropdown 
            onProjectSelect={handleProjectSelect}
            placeholder="Select a project..."
            className="project-selector-team-management"
          />
          {selectedProjectId && (
            <button 
              className="add-member-button"
              onClick={handleAddMember}
            >
              Add a member <span className="plus-icon">+</span>
            </button>
          )}
        </div>

        {!selectedProjectId ? (
          <div className="no-project-selected">
            <p>Please select a project to view team members</p>
          </div>
        ) : loading ? (
          <div className="loading">Loading team members...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="team-members-section">
            <div className="team-filter-bar">
              <div className="team-title">Team Members</div>
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Enter user's name..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="search-input"
                />
                <button className="search-button">
                  <i className="search-icon"></i>
                </button>
              </div>
              <div className="filter-container">
                <span className="filter-label">Filter by specialization:</span>
                <select
                  value={specialization}
                  onChange={handleSpecializationChange}
                  className="filter-select"
                >
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="team-table-container">
              <table className="team-table">
                <thead>
                  <tr>
                    <th>Profile</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Specialization</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeamMembers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="no-data">No team members found</td>
                    </tr>
                  ) : (
                    filteredTeamMembers.map(member => (
                      <tr key={member.id}>
                        <td>
                          <div className="avatar-container">
                            <div className="avatar-placeholder">
                              {member.name.substring(0, 2).toUpperCase()}
                            </div>
                          </div>
                        </td>
                        <td>{member.name}</td>
                        <td>{member.email}</td>
                        <td>{member.specialization}</td>
                        <td className="action-buttons">
                          <button 
                            className="action-button-tasks"
                            onClick={() => handleViewMemberTasks(member)}
                          >
                            Go to tasks
                          </button>
                          <button 
                            className="action-button-remove"
                            onClick={() => handleRemoveMember(member)}
                          >
                            Remove
                          </button>
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
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {selectedProjectId && (
        <AddMemberModal
          isOpen={isAddMemberModalOpen}
          onClose={() => setIsAddMemberModalOpen(false)}
          onSuccess={handleMemberAdded}
          projectId={selectedProjectId}
          projectName={selectedProjectName}
        />
      )}
    </Layout>
  );
};

export default TeamManagement; 