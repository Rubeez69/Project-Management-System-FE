import React, { useState, useEffect } from 'react';
import ProjectService from '../services/ProjectService';
import '../styles/CreateProjectModal.css';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: number;
}

interface ProjectDetail {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string | null;
  status: string;
  teamMembers: any[];
}

interface ApiErrorResponse {
  code: number;
  message: string | null;
  result: any;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({ isOpen, onClose, onSuccess, projectId }) => {
  const [projectName, setProjectName] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchLoading, setFetchLoading] = useState<boolean>(true);
  const [originalProject, setOriginalProject] = useState<ProjectDetail | null>(null);
  const [errors, setErrors] = useState<{
    name?: string;
    startDate?: string;
    endDate?: string;
    api?: string;
  }>({});

  // Fetch project details when modal opens
  useEffect(() => {
    if (isOpen && projectId) {
      fetchProjectDetails();
    }
  }, [isOpen, projectId]);

  // Fetch project details from API
  const fetchProjectDetails = async () => {
    try {
      setFetchLoading(true);
      const projectDetail = await ProjectService.getProjectDetail(projectId);
      
      // Set form values
      setProjectName(projectDetail.name);
      setStartDate(projectDetail.startDate);
      setEndDate(projectDetail.endDate || '');
      setStatus(projectDetail.status);
      setDescription(projectDetail.description);
      
      // Store original values for reset functionality
      setOriginalProject(projectDetail);
      
      setErrors({});
    } catch (error) {
      console.error('Error fetching project details:', error);
      setErrors({
        api: 'Failed to load project details. Please try again.'
      });
    } finally {
      setFetchLoading(false);
    }
  };

  // Reset form to original values
  const handleReset = () => {
    if (originalProject) {
      setProjectName(originalProject.name);
      setStartDate(originalProject.startDate);
      setEndDate(originalProject.endDate || '');
      setStatus(originalProject.status);
      setDescription(originalProject.description);
      setErrors({});
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({});
    
    // Validate inputs
    const newErrors: {
      name?: string;
      startDate?: string;
      endDate?: string;
    } = {};
    
    if (!projectName.trim()) {
      newErrors.name = 'Project name is required';
    }
    
    if (!startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      newErrors.endDate = 'Start date cannot be after end date';
    }
    
    // If there are validation errors, stop submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Submit form to API
    try {
      setLoading(true);
      
      const projectData = {
        name: projectName,
        startDate,
        endDate: endDate || undefined,
        description,
        status
      };
      
      await ProjectService.updateProject(projectId, projectData);
      
      // Notify parent component of success
      onSuccess();
      
      // Close modal
      onClose();
    } catch (error: any) {
      console.error('Error updating project:', error);
      
      // Handle API error
      if (error.response) {
        try {
          // Try to parse the response body
          const errorData: ApiErrorResponse = error.response.data;
          
          // Check for conflict error (project name already exists)
          if (errorData.code === 409) {
            setErrors({
              ...newErrors,
              name: errorData.message || 'Project name already exists'
            });
          } else {
            setErrors({
              ...newErrors,
              api: errorData.message || 'Failed to update project'
            });
          }
        } catch (parseError) {
          setErrors({
            ...newErrors,
            api: 'Failed to update project: Server error'
          });
        }
      } else if (error.message) {
        setErrors({
          ...newErrors,
          api: error.message
        });
      } else {
        setErrors({
          ...newErrors,
          api: 'An unexpected error occurred'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle field blur for validation
  const handleBlur = (field: string) => {
    const newErrors = { ...errors };
    
    if (field === 'name' && !projectName.trim()) {
      newErrors.name = 'Project name is required';
    } else if (field === 'name') {
      delete newErrors.name;
    }
    
    if (field === 'startDate' && !startDate) {
      newErrors.startDate = 'Start date is required';
    } else if (field === 'startDate') {
      delete newErrors.startDate;
    }
    
    if ((field === 'startDate' || field === 'endDate') && 
        startDate && endDate && new Date(startDate) > new Date(endDate)) {
      newErrors.endDate = 'Start date cannot be after end date';
    } else if (field === 'endDate' && startDate && endDate && new Date(startDate) <= new Date(endDate)) {
      delete newErrors.endDate;
    }
    
    setErrors(newErrors);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit project</h2>
        </div>
        
        {fetchLoading ? (
          <div className="modal-loading">Loading project details...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="projectName">Project Name:</label>
              <input
                type="text"
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onBlur={() => handleBlur('name')}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <div className="error-message">{errors.name}</div>}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Start Date:</label>
                <div className="date-input-container">
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    onBlur={() => handleBlur('startDate')}
                    className={errors.startDate ? 'error' : ''}
                  />
                  <span className="date-icon"></span>
                </div>
                {errors.startDate && <div className="error-message">{errors.startDate}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="endDate">End Date:</label>
                <div className="date-input-container">
                  <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    onBlur={() => handleBlur('endDate')}
                    className={errors.endDate ? 'error' : ''}
                  />
                  <span className="date-icon"></span>
                </div>
                {errors.endDate && <div className="error-message">{errors.endDate}</div>}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="status">Status:</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="status-select"
              >
                <option value="ACTIVE">Active</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description:</label>
              <textarea
                className='form-textarea'
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
              ></textarea>
            </div>
            
            {errors.api && <div className="api-error">{errors.api}</div>}
            
            <div className="modal-actions">
              <button 
                type="button" 
                className="action-button default-button" 
                onClick={handleReset}
                disabled={loading}
              >
                Default
              </button>
              <div className="spacer"></div>
              <button 
                type="button" 
                className="action-button cancel-button" 
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="action-button submit-button"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditProjectModal; 