import React, { useState, useEffect } from 'react';
import '../styles/SelectMemberModal.css';
import TeamService, { TeamMemberWithWorkload } from '../services/TeamService';

interface SelectMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMember: (member: TeamMemberWithWorkload) => void;
  projectId: number;
}

const SelectMemberModal: React.FC<SelectMemberModalProps> = ({
  isOpen,
  onClose,
  onSelectMember,
  projectId
}) => {
  const [members, setMembers] = useState<TeamMemberWithWorkload[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [specialization, setSpecialization] = useState<string>('All');
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  // Load team members with workload
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const response = await TeamService.getTeamMembersWithWorkload(projectId, currentPage);
        setMembers(response.content);
        setTotalPages(response.totalPages);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching team members with workload:', err);
        setError(err.message || 'Failed to load team members');
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && projectId) {
      fetchMembers();
    }
  }, [isOpen, projectId, currentPage]);

  // Get unique specializations for the filter dropdown
  const specializations = ['All', ...Array.from(new Set(members.map(member => member.specialization)))];

  // Filter members by search term and specialization
  const filteredMembers = members.filter(member => {
    const matchesSearch = searchTerm === '' || 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialization = specialization === 'All' || 
      member.specialization === specialization;
    
    return matchesSearch && matchesSpecialization;
  });

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle specialization filter change
  const handleSpecializationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSpecialization(e.target.value);
  };

  // Handle radio button selection
  const handleMemberSelect = (memberId: number) => {
    setSelectedMemberId(memberId);
  };

  // Handle choose button click
  const handleChoose = () => {
    if (selectedMemberId) {
      const selectedMember = members.find(member => member.id === selectedMemberId);
      if (selectedMember) {
        onSelectMember(selectedMember);
      }
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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="select-member-modal">
        <div className="modal-header">
          <h2>Assign task for a member</h2>
          <button className="close-button" onClick={onClose}>X</button>
        </div>
        
        <div className="search-filter-container">
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
            <div className="select-container">
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
        </div>
        
        {loading ? (
          <div className="loading">Loading team members...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <>
            <div className="member-table-container">
              <table className="member-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Specialization</th>
                    <th>Workload</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="no-data">No team members found</td>
                    </tr>
                  ) : (
                    filteredMembers.map(member => (
                      <tr key={member.id}>
                        <td>
                          <input
                            type="radio"
                            name="selectedMember"
                            checked={selectedMemberId === member.id}
                            onChange={() => handleMemberSelect(member.id)}
                          />
                        </td>
                        <td>{member.name}</td>
                        <td>{member.email}</td>
                        <td>{member.specialization}</td>
                        <td>
                          {member.workload} tasks assigned
                          {member.workload >= 5 && (
                            <span className="warning-icon" title="High workload">⚠️</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
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
            
            <div className="modal-actions">
              <button 
                className="choose-button"
                onClick={handleChoose}
                disabled={selectedMemberId === null}
              >
                Choose
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SelectMemberModal; 