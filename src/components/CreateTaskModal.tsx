import React, { useState, useEffect } from 'react';
import '../styles/CreateTaskModal.css';
import SelectMemberModal from '../components/SelectMemberModal';
import { TeamMemberWithWorkload } from '../services/TeamService';
import { CreateTaskRequest } from '../services/ProjectTaskService';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: CreateTaskRequest) => Promise<void>;
  projectId: number;
  projectName: string;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  projectId,
  projectName
}) => {
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('LOW');
  const [assigneeId, setAssigneeId] = useState<number | undefined>(undefined);
  const [assigneeName, setAssigneeName] = useState('');
  
  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSelectMemberModalOpen, setIsSelectMemberModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Reset form fields
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStartDate('');
    setDueDate('');
    setPriority('LOW');
    setAssigneeId(undefined);
    setAssigneeName('');
    setErrors({});
    setIsSubmitting(false);
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
      await onSubmit({
        title,
        description,
        startDate,
        dueDate,
        priority,
        assigneeId
      });
      
      onClose();
    } catch (error: any) {
      if (error.message?.includes('similar')) {
        setErrors({ ...errors, title: 'A task with a similar name already exists' });
      } else {
        setErrors({ ...errors, submit: error.message || 'Failed to create task' });
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
          <h2>Creating a task for "{projectName}"</h2>
        </div>
        
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
          
          <div className="form-group priority-group">
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
              {isSubmitting ? 'Creating...' : 'Submit'}
            </button>
          </div>
        </form>
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

export default CreateTaskModal; 