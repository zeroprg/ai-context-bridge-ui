// ChatGPTIndicator.tsx
// At the top of your component file
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ChatGPTIndicator.css'; // Make sure to create this CSS file
import { API_URLS } from "../apiConstants"
import { ApiKey } from '../models/ApiKey';
import { useError } from '../ErrorContext';
import { Role } from '../models/Role';


interface APIKeyGridProps {
  apiKey: ApiKey;
  onMouseEnter: any;
}

const ChatGPTIndicator: React.FC<APIKeyGridProps> = ({ apiKey, onMouseEnter }) => {
  
  const { handleError } = useError();
  const [selectedAPI] = useState(apiKey.model);
  const [selectedRole, setSelectedRole] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const indicatorClass = isOpen || selectedRole ? "chatgpt-indicator" : "chatgpt-indicator chatgpt-indicator-flashing";


  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  useEffect(() => {
    if(!selectedRole){
      setLoading(true);
      axios.get(API_URLS.GPTAssistantRole, { withCredentials: true }).then(response => {
        setSelectedRole(response.data.role);
        setError('');
      })
        .catch(err => { handleError('Failed to fetch  selected Assistant role', err); console.error(err); })
        .finally(() => setLoading(false));
    };

    if (isOpen) {
      setLoading(true);
      axios.get(API_URLS.GPTAssistantRoles, { withCredentials: true }).then(response => {
        setRoles(response.data);
        setError('');
      })
        .catch(err => { handleError('Failed to fetch Assistant roles', err); console.error(err); })
        .finally(() => setLoading(false));
    }

  }, [isOpen, selectedRole]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleRoleSelect = (role: string) => {
    const payload = `${role}`;
    setIsOpen(false); // Close the dropdown after selection
    axios.post(API_URLS.SetGPTAssistantRole, { data: payload }, { withCredentials: true }).then(response => {
      setSelectedRole(role);
    })
      .catch(error => { handleError('Error fetching API keys ', error); })

  }


  return (
    <div className="chatgpt-indicator-container" onMouseEnter={onMouseEnter}>
     
      <div className={indicatorClass} onClick={toggleDropdown}>  
        {selectedAPI} acts as {selectedRole} <span className="dropdown-indicator">{isOpen ? '▲' : '▼'}</span>

        {isOpen && (
          <div ref={wrapperRef} className="chatgpt-dropdown">
            {loading && <div>Loading...</div>}
            {error && <div>{error}</div>}
            {roles.map((role, index) => (
                <div key={index} className="dropdown-item" title={role.description} onClick={() => handleRoleSelect(role.role)}>{role.role}</div>
            ))}
        </div>
        )}
      </div>
    </div>
  );
}

export default ChatGPTIndicator;
