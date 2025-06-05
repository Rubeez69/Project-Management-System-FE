import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';
import TeamService, { TeamMember } from '../services/TeamService';
import '../styles/MyTeam.css';
import { useNavigate } from 'react-router-dom';
import ProjectSelector, { ProjectOption } from '../components/ProjectSelector';

const MyTeam: React.FC = () => {
  const { user } = useAuth();
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [specialization, setSpecialization] = useState<string>('All');
  
  // Debug state
  const [debugInfo, setDebugInfo] = useState<string>('');
  
  // Use ref to track if a fetch is in progress and to prevent unwanted effects
  const pageChangeInProgress = useRef(false);

  const navigate = useNavigate();

  // Handle project selection
  const handleProjectSelect = useCallback((selected: ProjectOption | null) => {
    if (selected) {
      console.log('Project selected:', selected);
      setSelectedProjectId(selected.value);
      setCurrentPage(0);
      setSearchTerm('');
      setSpecialization('All');
    }
  }, []);

  // Load team members for selected project
  const fetchTeamMembers = useCallback(async () => {
    if (!selectedProjectId) return;
    
    // Prevent duplicate fetches
    if (pageChangeInProgress.current) {
      console.log('Fetch already in progress, skipping');
      return;
    }
    
    try {
      pageChangeInProgress.current = true;
      setLoading(true);
      
      const pageToFetch = currentPage;
      setDebugInfo(`Fetching page ${pageToFetch} for project ${selectedProjectId}`);
      
      const url = `${window.location.protocol}//${window.location.hostname}:8080/api/team-members/projects/${selectedProjectId}/my-team?page=${pageToFetch}&size=5`;
      console.log('Fetching from URL:', url);
      
      const response = await TeamService.getMyTeamMembers(selectedProjectId, pageToFetch);
      console.log('API Response:', response);
      
      // Always update state regardless of page changes during fetch
      setTeamMembers(response.content);
      setTotalPages(response.totalPages);
      setError(null);
      setDebugInfo(`Fetched page ${pageToFetch + 1}/${response.totalPages} with ${response.content.length} members`);
      console.log(`After fetch: currentPage=${currentPage}, totalPages=${response.totalPages}`);
    } catch (err: any) {
      console.error(`Error fetching team members for project ${selectedProjectId}:`, err);
      setError(err.message || 'Failed to load team members');
      setTeamMembers([]);
      setDebugInfo(`Error: ${err.message}`);
    } finally {
      setLoading(false);
      pageChangeInProgress.current = false;
    }
  }, [selectedProjectId, currentPage]);

  // Effect for project changes
  useEffect(() => {
    if (selectedProjectId !== null) {
      console.log('Project changed to:', selectedProjectId);
      fetchTeamMembers();
    }
  }, [selectedProjectId, fetchTeamMembers]);

  // Reset page when search or filter changes
  useEffect(() => {
    if (selectedProjectId !== null && (searchTerm !== '' || specialization !== 'All')) {
      setCurrentPage(0);
    }
  }, [searchTerm, specialization, selectedProjectId]);

  // Handle pagination - explicitly prevent default to avoid any issues
  const goToNextPage = useCallback((e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    console.log('Going to next page from', currentPage);
    if (currentPage < totalPages - 1) {
      const nextPage = currentPage + 1;
      console.log('Setting page to', nextPage);
      setCurrentPage(nextPage);
    }
  }, [currentPage, totalPages]);

  const goToPreviousPage = useCallback((e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    console.log('Going to previous page from', currentPage);
    if (currentPage > 0) {
      const prevPage = currentPage - 1;
      console.log('Setting page to', prevPage);
      setCurrentPage(prevPage);
    }
  }, [currentPage]);

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

  // Handle navigation to team member tasks
  const goToMemberTasks = (member: TeamMember) => {
    if (selectedProjectId) {
      navigate(`/project/${selectedProjectId}/member/${member.userId}/tasks/${encodeURIComponent(member.name)}`);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle specialization filter change
  const handleSpecializationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSpecialization(e.target.value);
  };

  // Calculate if buttons should be disabled - use state values directly without additional conditions
  const isPrevButtonDisabled = currentPage <= 0;
  const isNextButtonDisabled = currentPage >= totalPages - 1;

  // Add debug log before render
  console.log(`Rendering with currentPage=${currentPage}, totalPages=${totalPages}`);

  return (
    <Layout
      pageTitle="My Team"
      userRole={user?.role || 'user'}
      username={user?.name || 'User'}
    >
      <div className="team-container">
        <div className="project-selector-container">
          <ProjectSelector 
            onProjectSelect={handleProjectSelect}
            label="Select a project:"
            className="project-selector-team"
            defaultProjectId={selectedProjectId || undefined}
          />
        </div>

        {loading && !selectedProjectId ? (
          <div className="loading">Loading projects...</div>
        ) : loading ? (
          <div className="loading">Loading team members...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <>
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
                <span className="filter-label-my-team">Filter by specialization:</span>
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
                        <td>
                          <button 
                            className="action-button-team"
                            onClick={() => goToMemberTasks(member)}
                          >
                            Go to tasks
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <button 
                className={`pagination-button ${isPrevButtonDisabled ? 'disabled' : ''}`}
                onClick={goToPreviousPage}
                disabled={isPrevButtonDisabled}
              >
                «
              </button>
              <span className="pagination-info">
                {currentPage + 1}/{totalPages}
              </span>
              <button 
                className={`pagination-button ${isNextButtonDisabled ? 'disabled' : ''}`}
                onClick={goToNextPage}
                disabled={isNextButtonDisabled}
              >
                »
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default MyTeam; 