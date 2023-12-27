import React, { useState } from 'react';
import { CSSProperties } from 'react';
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

  const toggleButtonStyle:CSSProperties = {
    position: 'fixed',
    left: isOpen ? '250px' : '0px',
    top: '50%',    
    transform: 'translateY(-50%)',
    background: 'var(--primary-bg-color)', // Use variable for background color
    color: 'var(--primary-text-color)', // Use variable for icon/text color
    border: 'none',
    cursor: 'pointer',
    zIndex: 1001,
    transition: 'transform 0.3s ease-in-out',
};

  

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
        <li><a href="https://buy.stripe.com/aEU183cx3flV0mI8wB">Donate $1 to use other APIs</a></li>
        <li><a href="https://buy.stripe.com/28o4kfeFb4Hhb1maEI">Donate $3 to use other APIs</a></li>        
        <li><a href="https://buy.stripe.com/fZeaIDeFb3DdglGdQT">Donate $10 to use other APIs</a></li>
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
  <div style={toggleButtonStyle} onClick={toggleOpen} title={buttonHint}>
    {isOpen ? <FaArrowLeft size={30}/> : <FaArrowRight size={30}/>}
  </div>
</>
  );
};

export default SlideComponent;
