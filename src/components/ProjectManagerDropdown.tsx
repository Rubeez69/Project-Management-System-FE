import React, { useState, useEffect } from 'react';
import AsyncSelect from 'react-select/async';
import ProjectService, { ProjectDropdownItem } from '../services/ProjectService';
import '../styles/ProjectSelector.css';

// Define the option type for AsyncSelect
export interface ProjectOption {
  value: number;
  label: string;
}

interface ProjectManagerDropdownProps {
  onProjectSelect: (selected: ProjectOption | null) => void;
  className?: string;
  label?: string;
  placeholder?: string;
  defaultProjectId?: number;
}

const ProjectManagerDropdown: React.FC<ProjectManagerDropdownProps> = ({
  onProjectSelect,
  className = 'project-selector',
  label = 'Select a project:',
  placeholder = 'Search projects...',
  defaultProjectId
}) => {
  const [selectedProject, setSelectedProject] = useState<ProjectOption | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [projectsLoaded, setProjectsLoaded] = useState<boolean>(false);

  // Load options for AsyncSelect
  const loadOptions = async (inputValue: string): Promise<ProjectOption[]> => {
    try {
      const projectData = await ProjectService.getProjectsDropdown(inputValue);
      return projectData.map(project => ({
        value: project.id,
        label: project.name
      }));
    } catch (err: any) {
      console.error('Error loading project options:', err);
      return [];
    }
  };

  // Load initial project list and select the first one or the default if provided
  useEffect(() => {
    // Skip if projects already loaded and we have a selection
    if (projectsLoaded && selectedProject) {
      return;
    }

    const loadInitialProject = async () => {
      try {
        setIsLoading(true);
        const projectData = await ProjectService.getProjectsDropdown('');
        
        if (projectData.length > 0) {
          let initialProject: ProjectOption | null = null;
          
          // If defaultProjectId is provided, find that project
          if (defaultProjectId) {
            const defaultProject = projectData.find(p => p.id === defaultProjectId);
            if (defaultProject) {
              initialProject = {
                value: defaultProject.id,
                label: defaultProject.name
              };
            }
          }
          
          // If no default project was found or provided, use the first one
          if (!initialProject && projectData.length > 0) {
            initialProject = {
              value: projectData[0].id,
              label: projectData[0].name
            };
          }
          
          if (initialProject) {
            setSelectedProject(initialProject);
            onProjectSelect(initialProject);
          }
          setProjectsLoaded(true);
        }
      } catch (err: any) {
        console.error('Error loading initial project:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialProject();
  }, [defaultProjectId, onProjectSelect, projectsLoaded, selectedProject]);

  // Handle project selection
  const handleProjectSelect = (selected: ProjectOption | null) => {
    console.log('Project selected in dropdown:', selected);
    setSelectedProject(selected);
    onProjectSelect(selected);
  };

  return (
    <div className={className}>
      <AsyncSelect
        cacheOptions
        loadOptions={loadOptions}
        defaultOptions
        placeholder={placeholder}
        onChange={handleProjectSelect}
        className="react-select-container"
        classNamePrefix="react-select"
        value={selectedProject}
        isLoading={isLoading}
        key={`project-manager-dropdown-${defaultProjectId || 'default'}`}
      />
    </div>
  );
};

export default ProjectManagerDropdown; 