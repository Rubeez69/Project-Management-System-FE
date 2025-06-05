import React, { useState, useEffect } from 'react';
import TeamService, { SelectableMember, Specialization, AddMemberRequest } from '../services/TeamService';
import '../styles/AddMemberModal.css';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: number;
  projectName: string;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  projectId,
  projectName
}) => {
  const [members, setMembers] = useState<SelectableMember[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [specializationFilter, setSpecializationFilter] = useState<string>('All');
  
  // Track selected members and their specializations
  const [selectedMembers, setSelectedMembers] = useState<Map<number, number>>(new Map());
  const [checkedMembers, setCheckedMembers] = useState<Set<number>>(new Set());

  // Fetch members and specializations when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchMembers();
      fetchSpecializations();
    } else {
      // Reset state when modal closes
      setSelectedMembers(new Map());
      setCheckedMembers(new Set());
      setSearchTerm('');
      setSpecializationFilter('All');
      setCurrentPage(0);
    }
  }, [isOpen, projectId, currentPage]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await TeamService.getSelectableMembers(projectId, currentPage);
      setMembers(response.content);
      setTotalPages(response.totalPages);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching selectable members:', err);
      setError('Failed to load available members. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecializations = async () => {
    try {
      const specs = await TeamService.getSpecializations();
      setSpecializations(specs);
    } catch (err: any) {
      console.error('Error fetching specializations:', err);
      // Don't set error state here to avoid blocking the UI
    }
  };

  // Handle checkbox change
  const handleCheckboxChange = (memberId: number) => {
    const newCheckedMembers = new Set(checkedMembers);
    if (newCheckedMembers.has(memberId)) {
      newCheckedMembers.delete(memberId);
    } else {
      newCheckedMembers.add(memberId);
    }
    setCheckedMembers(newCheckedMembers);
  };

  // Handle specialization selection for a member
  const handleSpecializationChange = (memberId: number, specializationId: number) => {
    const newSelectedMembers = new Map(selectedMembers);
    newSelectedMembers.set(memberId, specializationId);
    setSelectedMembers(newSelectedMembers);
  };

  // Handle adding a single member
  const handleAddSingleMember = async (memberId: number) => {
    const specializationId = selectedMembers.get(memberId);
    if (!specializationId) {
      alert('Please select a specialization for this member.');
      return;
    }

    try {
      const request: AddMemberRequest[] = [
        { userId: memberId, specializationId }
      ];
      
      await TeamService.addTeamMembers(projectId, request);
      
      // Remove the added member from the list
      setMembers(members.filter(member => member.id !== memberId));
      
      // Remove from selected and checked maps
      const newSelectedMembers = new Map(selectedMembers);
      newSelectedMembers.delete(memberId);
      setSelectedMembers(newSelectedMembers);
      
      const newCheckedMembers = new Set(checkedMembers);
      newCheckedMembers.delete(memberId);
      setCheckedMembers(newCheckedMembers);
      
      // Notify parent component
      onSuccess();
    } catch (err) {
      console.error('Error adding team member:', err);
      alert('Failed to add team member. Please try again.');
    }
  };

  // Handle adding multiple members
  const handleAddSelectedMembers = async () => {
    if (checkedMembers.size === 0) {
      alert('Please select at least one member to add.');
      return;
    }

    // Check if all selected members have specializations assigned
    let allHaveSpecializations = true;
    const requests: AddMemberRequest[] = [];

    checkedMembers.forEach(memberId => {
      const specializationId = selectedMembers.get(memberId);
      if (!specializationId) {
        allHaveSpecializations = false;
      } else {
        requests.push({ userId: memberId, specializationId });
      }
    });

    if (!allHaveSpecializations) {
      alert('Please select a specialization for all checked members.');
      return;
    }

    try {
      await TeamService.addTeamMembers(projectId, requests);
      
      // Remove added members from the list
      setMembers(members.filter(member => !checkedMembers.has(member.id)));
      
      // Reset selected and checked members
      setSelectedMembers(new Map());
      setCheckedMembers(new Set());
      
      // Notify parent component
      onSuccess();
    } catch (err) {
      console.error('Error adding team members:', err);
      alert('Failed to add team members. Please try again.');
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle specialization filter change
  const handleSpecializationFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSpecializationFilter(e.target.value);
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

  // Filter members by search term
  const filteredMembers = members.filter(member => {
    return member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           member.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="add-member-modal">
        <div className="modal-header">
          <h2>Add Members to "{projectName}"</h2>
          <button className="close-button" onClick={onClose}>X</button>
        </div>

        <div className="modal-search-bar">
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
            <span>Filter by specialization:</span>
            <select
              value={specializationFilter}
              onChange={handleSpecializationFilterChange}
              className="filter-select"
            >
              <option value="All">All</option>
              {specializations.map(spec => (
                <option key={spec.id} value={spec.name}>{spec.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="members-table-container">
          <table className="members-table">
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Email</th>
                <th>Specialization</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="loading-cell">Loading members...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="error-cell">{error}</td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-cell">No members available to add</td>
                </tr>
              ) : (
                filteredMembers.map(member => (
                  <tr key={member.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={checkedMembers.has(member.id)}
                        onChange={() => handleCheckboxChange(member.id)}
                        className="member-checkbox"
                      />
                    </td>
                    <td>{member.name}</td>
                    <td>{member.email}</td>
                    <td>
                      <select
                        value={selectedMembers.get(member.id) || ''}
                        onChange={(e) => handleSpecializationChange(member.id, parseInt(e.target.value))}
                        className="specialization-select"
                      >
                        <option value="">Select specialization</option>
                        {specializations.map(spec => (
                          <option key={spec.id} value={spec.id}>{spec.name}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        className="add-single-button"
                        onClick={() => handleAddSingleMember(member.id)}
                        disabled={!selectedMembers.has(member.id)}
                      >
                        +
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

        <div className="modal-footer">
          <button
            className="add-selected-button"
            onClick={handleAddSelectedMembers}
            disabled={checkedMembers.size === 0}
          >
            Add <span className="plus-icon">+</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal; 