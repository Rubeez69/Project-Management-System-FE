import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import ProjectService, { ProjectDetail as ProjectDetailType } from '../services/ProjectService';
import AddMemberModal from '../components/AddMemberModal';
import '../styles/ProjectDetail.css';

interface TeamMember {
  id: number;
  userId: number;
  profile: string | null;
  name: string;
  email: string;
  specialization: string;
}

// Function to get avatar background color based on the first letter
const getAvatarColor = (name: string): string => {
  const firstLetter = name.charAt(0).toUpperCase();
  
  // Different colors for different letters
  if (/[A-D]/.test(firstLetter)) return '#e8f5e9'; // Light green for A-D
  if (/[E-H]/.test(firstLetter)) return '#e3f2fd'; // Light blue for E-H
  if (/[I-L]/.test(firstLetter)) return '#f3e5f5'; // Light purple for I-L
  if (/[M-P]/.test(firstLetter)) return '#fff3e0'; // Light orange for M-P
  if (/[Q-T]/.test(firstLetter)) return '#e0f7fa'; // Light cyan for Q-T
  if (/[U-Z]/.test(firstLetter)) return '#fce4ec'; // Light pink for U-Z
  
  return '#f5f5f5'; // Default light gray
};

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<ProjectDetailType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchProjectDetail = async () => {
      if (!projectId) {
        setError('Project ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const projectData = await ProjectService.getProjectDetail(parseInt(projectId, 10));
        setProject(projectData);
        setError(null);
      } catch (err) {
        console.error('Error fetching project details:', err);
        setError('Failed to load project details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetail();
  }, [projectId]);

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const handleManageFullTeam = () => {
    // Navigate to team management page
    navigate('/team-management');
  };

  const handleGoToTasks = (member: TeamMember) => {
    // Navigate to tasks for this team member
    navigate(`/project/${projectId}/member/${member.userId}/tasks/${encodeURIComponent(member.name)}`);
  };

  const handleRemoveMember = (memberId: number) => {
    // Remove team member logic
    console.log(`Remove member ${memberId}`);
  };

  const handleAddMember = () => {
    setIsAddMemberModalOpen(true);
  };

  const handleMemberAdded = () => {
    // Refresh project details to show new team members
    if (projectId) {
      const refreshProjectDetail = async () => {
        try {
          setLoading(true);
          const projectData = await ProjectService.getProjectDetail(parseInt(projectId, 10));
          setProject(projectData);
        } catch (err) {
          console.error('Error refreshing project details:', err);
        } finally {
          setLoading(false);
        }
      };
      
      refreshProjectDetail();
    }
  };

  if (loading) {
    return (
      <Layout 
        pageTitle="Project Details" 
        userRole="project-manager"
        username={user?.name || 'Project Manager'}
      >
        <div className="loading">Loading project details...</div>
      </Layout>
    );
  }

  if (error || !project) {
    return (
      <Layout 
        pageTitle="Project Details" 
        userRole="project-manager"
        username={user?.name || 'Project Manager'}
      >
        <div className="error">{error || 'Project not found'}</div>
      </Layout>
    );
  }

  return (
    <Layout 
      pageTitle="Project Details" 
      userRole="project-manager"
      username={user?.name || 'Project Manager'}
    >
      <div className="project-detail-container">
        {/* Navigation Tabs */}
        <div className="project-tabs">
          <div className="tab active">Project Info</div>
          <div className="tab">Team Chat</div>
          <div className="tab highlight">Manage this project's tasks</div>
        </div>

        {/* Project Info Section */}
        <div className="project-info-section">
          <div className="project-info-row">
            <div className="project-info-label">Project Name:</div>
            <div className="project-info-value">{project.name}</div>
            
            <div className="project-info-status-container">
              <div className="project-info-label">Status:</div>
              <div className={`project-status-badge ${project.status.toLowerCase()}`}>
                {project.status}
              </div>
              <button className="gantt-button">View Gantt</button>
            </div>
          </div>

          <div className="project-info-row">
            <div className="project-info-label">Description:</div>
            <div className="project-info-value">{project.description}</div>
          </div>

          <div className="project-info-row">
            <div className="project-info-label">Start date:</div>
            <div className="project-info-value">{formatDate(project.startDate)}</div>
          </div>

          <div className="project-info-row">
            <div className="project-info-label">End date:</div>
            <div className="project-info-value">{formatDate(project.endDate)}</div>
          </div>
        </div>

        {/* Team Members Section */}
        <div className="team-section-header">
          <h2>Team Members</h2>
          <div className="team-action-buttons">
            <button className="add-team-button" onClick={handleAddMember}>
              Add Member
            </button>
            <button className="manage-team-button" onClick={handleManageFullTeam}>
              Manage Full Team
            </button>
          </div>
        </div>

        <div className="team-members-table">
          <table>
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
              {project.teamMembers.map((member: TeamMember) => (
                <tr key={member.id}>
                  <td>
                    <div className="member-avatar">
                      {member.profile ? (
                        <img src={member.profile} alt={member.name} />
                      ) : (
                        <div 
                          className="avatar-placeholder"
                          style={{ backgroundColor: getAvatarColor(member.name) }}
                        >
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>{member.name}</td>
                  <td>{member.email}</td>
                  <td>{member.specialization}</td>
                  <td className="action-buttons">
                    <button 
                      className="task-button"
                      onClick={() => handleGoToTasks(member)}
                    >
                      Go to tasks
                    </button>
                    <button 
                      className="remove-button"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      {projectId && (
        <AddMemberModal
          isOpen={isAddMemberModalOpen}
          onClose={() => setIsAddMemberModalOpen(false)}
          onSuccess={handleMemberAdded}
          projectId={parseInt(projectId, 10)}
          projectName={project.name}
        />
      )}
    </Layout>
  );
};

export default ProjectDetail; 