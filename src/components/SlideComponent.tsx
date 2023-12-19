import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';

import './SlideComponent.css'; // Your CSS file
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'; // Import icons

interface SlideComponentProps {
  title: string;
}

const SlideComponent: React.FC<SlideComponentProps> = ({ title }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [buttonHint, setButtonHint] = useState("More info");
  const { user } = useUser();
  const navigate = useNavigate();    

  const navigateToAddAPI = () => {
    navigate("/add-api");
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    setButtonHint(isOpen ? "More info" : "Hide Info");
  };

  return (
<>
  <div className={`sidebar ${isOpen ? 'open' : ''}`}>
    <div className="sidebar-header">
        <h3>API Management</h3>
      <ul>
        <li><a href="#add-api" onClick={navigateToAddAPI}>Add a new API key</a></li>
        <li><a href="#share-api">Share my API keys</a></li>
        <li><a href="#donate">Donate to use other APIs</a></li>
      </ul>
    </div>

    <div className="sidebar-menu">

    </div>

    <div className="sidebar-footer">
      {/* Footer Content Here, if any */}
      <div className="user-info">
        {user?.pictureLink && <img src={user.pictureLink} alt={user.name} className="user-picture" />}
        <div className="user-details">
            {user?.name && <p><i className="fa fa-user icon"></i> {user.name}</p>}
      </div>
</div>

    </div>
  </div>
  <div className="toggle-button" onClick={toggleOpen} title={buttonHint}>
    {isOpen ? <FaArrowLeft /> : <FaArrowRight />}
  </div>
</>
  );
};

export default SlideComponent;
