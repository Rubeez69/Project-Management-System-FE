import React, { useState, useEffect } from 'react';
import '../styles/CreateTaskModal.css'; // Reuse the same styles
import SelectMemberModal from './SelectMemberModal';
import { TeamMemberWithWorkload } from '../services/TeamService';
import ProjectTaskService, { UpdateTaskRequest, TaskDetail } from '../services/ProjectTaskService';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  taskId: number;
  projectId: number;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  taskId,
  projectId
}) => {
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('LOW');
  const [status, setStatus] = useState<'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED'>('TODO');
  const [assigneeId, setAssigneeId] = useState<number | undefined>(undefined);
  const [assigneeName, setAssigneeName] = useState('');
  
  // Original task data for the "Default" button
  const [originalTask, setOriginalTask] = useState<TaskDetail | null>(null);
  
  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSelectMemberModalOpen, setIsSelectMemberModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch task details when modal opens
  useEffect(() => {
    if (isOpen && taskId) {
      fetchTaskDetails();
    }
  }, [isOpen, taskId]);

  // Fetch task details from API
  const fetchTaskDetails = async () => {
    try {
      setIsLoading(true);
      const taskDetail = await ProjectTaskService.getTaskById(taskId);
      
      // Set form values
      setTitle(taskDetail.title);
      setDescription(taskDetail.description || '');
      setStartDate(taskDetail.startDate);
      setDueDate(taskDetail.dueDate || '');
      setPriority(taskDetail.priority);
      setStatus(taskDetail.status);
      
      if (taskDetail.assignee) {
        setAssigneeId(taskDetail.assignee.id);
        setAssigneeName(taskDetail.assignee.name);
      } else {
        setAssigneeId(undefined);
        setAssigneeName('');
      }
      
      // Store original values for reset functionality
      setOriginalTask(taskDetail);
      
      setErrors({});
    } catch (error: any) {
      console.error('Error fetching task details:', error);
      setErrors({
        submit: error.message || 'Failed to load task details'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form to original values
  const handleReset = () => {
    if (originalTask) {
      setTitle(originalTask.title);
      setDescription(originalTask.description || '');
      setStartDate(originalTask.startDate);
      setDueDate(originalTask.dueDate || '');
      setPriority(originalTask.priority);
      setStatus(originalTask.status);
      
      if (originalTask.assignee) {
        setAssigneeId(originalTask.assignee.id);
        setAssigneeName(originalTask.assignee.name);
      } else {
        setAssigneeId(undefined);
        setAssigneeName('');
      }
      
      setErrors({});
    }
  };

  // Validate form fields
  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'title':
        if (!value.trim()) {
          newErrors.title = 'Task name is required';
        } else {
          delete newErrors.title;
        }
        break;
      case 'startDate':
        if (!value) {
          newErrors.startDate = 'Start date is required';
        } else if (dueDate && value > dueDate) {
          newErrors.startDate = 'Start date cannot be after due date';
        } else {
          delete newErrors.startDate;
          
          // Also check due date error if it exists
          if (dueDate && newErrors.dueDate === 'Start date cannot be after due date') {
            delete newErrors.dueDate;
          }
        }
        break;
      case 'dueDate':
        if (startDate && value && startDate > value) {
          newErrors.dueDate = 'Start date cannot be after due date';
        } else {
          delete newErrors.dueDate;
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle field change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    switch (name) {
      case 'title':
        setTitle(value);
        break;
      case 'description':
        setDescription(value);
        break;
      case 'startDate':
        setStartDate(value);
        break;
      case 'dueDate':
        setDueDate(value);
        break;
      case 'priority':
        setPriority(value as 'LOW' | 'MEDIUM' | 'HIGH');
        break;
      case 'status':
        setStatus(value as 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED');
        break;
      default:
        break;
    }
    
    validateField(name, value);
  };

  // Handle field blur for validation
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const isTitleValid = validateField('title', title);
    const isStartDateValid = validateField('startDate', startDate);
    const isDueDateValid = validateField('dueDate', dueDate);
    
    if (!isTitleValid || !isStartDateValid || !isDueDateValid) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const taskData: UpdateTaskRequest = {
        title,
        description,
        startDate,
        dueDate,
        priority,
        status,
        assigneeId
      };
      
      await ProjectTaskService.updateTask(taskId, projectId, taskData);
      
      onSuccess();
      onClose();
    } catch (error: any) {
      if (error.message?.includes('similar')) {
        setErrors({ ...errors, title: 'A task with a similar name already exists' });
      } else {
        setErrors({ ...errors, submit: error.message || 'Failed to update task' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle member selection
  const handleMemberSelected = (member: TeamMemberWithWorkload) => {
    setAssigneeId(member.userId);
    setAssigneeName(member.name);
    setIsSelectMemberModalOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="create-task-modal">
        <div className="modal-header">
          <h2>Edit Task</h2>
        </div>
        
        {isLoading ? (
          <div className="modal-loading">Loading task details...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">
                Task Name: <span className="required">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={title}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter task name"
                className={errors.title ? 'error' : ''}
              />
              {errors.title && <div className="error-message">{errors.title}</div>}
            </div>
            
            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="startDate">
                  Start Date: <span className="required">*</span>
                </label>
                <div className="date-input-container">
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={startDate}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.startDate ? 'error' : ''}
                  />
                  <button type="button" className="calendar-button">
                    <i className="calendar-icon"></i>
                  </button>
                </div>
                {errors.startDate && <div className="error-message">{errors.startDate}</div>}
              </div>
              
              <div className="form-group half">
                <label htmlFor="dueDate">End Date:</label>
                <div className="date-input-container">
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    value={dueDate}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.dueDate ? 'error' : ''}
                  />
                  <button type="button" className="calendar-button">
                    <i className="calendar-icon"></i>
                  </button>
                </div>
                {errors.dueDate && <div className="error-message">{errors.dueDate}</div>}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                name="description"
                value={description}
                onChange={handleChange}
                placeholder="Enter task description"
                rows={4}
              />
            </div>
            
            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="priority">Priority:</label>
                <div className="select-container">
                  <select
                    id="priority"
                    name="priority"
                    value={priority}
                    onChange={handleChange}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group half">
                <label htmlFor="status">Status:</label>
                <div className="select-container">
                  <select
                    id="status"
                    name="status"
                    value={status}
                    onChange={handleChange}
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="form-group assign-group">
              <label>Assign to:</label>
              <div className="assign-input-container">
                <input
                  type="text"
                  value={assigneeName}
                  placeholder="Select a team member in the list"
                  readOnly
                />
                <button 
                  type="button" 
                  className="team-member-list-button"
                  onClick={() => setIsSelectMemberModalOpen(true)}
                >
                  Team Member List
                </button>
              </div>
            </div>
            
            {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}
            
            <div className="modal-actions">
              <button 
                type="button" 
                className="default-button" 
                onClick={handleReset}
                disabled={isSubmitting}
              >
                Default
              </button>
              <div className="spacer"></div>
              <button 
                type="button" 
                className="cancel-button" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="submit-button-tm" 
                disabled={isSubmitting || Object.keys(errors).length > 0}
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        )}
      </div>
      
      {isSelectMemberModalOpen && (
        <SelectMemberModal
          isOpen={isSelectMemberModalOpen}
          onClose={() => setIsSelectMemberModalOpen(false)}
          onSelectMember={handleMemberSelected}
          projectId={projectId}
        />
      )}
    </div>
  );
};

export default EditTaskModal; 