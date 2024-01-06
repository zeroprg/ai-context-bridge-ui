import React, { useState, useEffect } from 'react';
import { CSSProperties } from 'react';
//import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import { storeContext} from "../utils/llama";

import './SlideComponent.css'; // Your CSS file
//import './MessageBar.css'; // Make sure this CSS file exists
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'; // Import icons
import { Context } from '../models/Context';
import { AiOutlineAccountBook, AiOutlineDelete } from 'react-icons/ai';
import { API_URLS } from '../apiConstants';
import axios from 'axios';
import { useError } from '../ErrorContext';
import { getCookie } from '../auth';
import { isFocusable } from '@testing-library/user-event/dist/utils';

interface SlideComponentProps {
  onSend: (message: string) => void;
}

const SlideComponent: React.FC<SlideComponentProps> = ({ onSend }) => {
  const { user, setUser } = useUser();
    // State to hold contexts
  const [groupedContexts, setGroupedContexts] = useState<Record<string, Context[]>>({});
  const { handleError } = useError();
  const [isOpen, setIsOpen] = useState(false);
  const [buttonHint, setButtonHint] = useState("More info");

  //const navigate = useNavigate();    

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

  
/*
  const navigateToAddAPI = () => {
    navigate("/add-api");
  };
*/
  const toggleOpen = () => {
    setIsOpen(!isOpen);
    setButtonHint(isOpen ? "More info" : "Hide Info");
  };

 // Function to format date
 const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
};


useEffect(() => {
  const contexts: Record<string, Context> = (user as any)?.contexts || {};
  const groups: Record<string, Context[]> = {};

  Object.values(contexts).forEach((context) => {
    const dateKey = context.lastUsed 
      ? formatDate(new Date(context.lastUsed))
      : 'Unknown';

    groups[dateKey] = groups[dateKey] || [];
    groups[dateKey].push(context);
  });

  setGroupedContexts(groups);
}, [user]); // Dependency array includes 'user'

const processConversationHistory = (conversationHistoryStr:string) => {
  if (conversationHistoryStr) {
    try {
      const conversationHistory = JSON.parse(conversationHistoryStr);
      let assistantRole = 'Bot';
      if (Array.isArray(conversationHistory)) {
        let messageText = '';
        conversationHistory.forEach(message => {
         
          if( message.role === 'system' ) {
            assistantRole = message.content; 
          
          } else {
            if( message.role === 'assistant' ) messageText +=  `${assistantRole}: ${message.content}\n`;
            else if( message.role === 'user' ) messageText += `You: ${message.content}\n`;
                      
          }  
        });
        onSend('$clearOutputPanel');
        onSend(messageText);
      }
    } catch (error) {
      console.error("Error parsing conversationHistory:", error);
    }
  }
};


const handleRemoveFile = (fileName: string) => { 
    // Remove file from context
  axios.delete(API_URLS.DeleteFileFromContext(fileName), {withCredentials: true}).then(response =>{
    setUser(response.data);
  })
  .catch(error => {handleError('' + error + ' ' + error.response?.data.message, error);  })
}  

  const  handleShowContext = (context: Context) => {
    console.log("handleShowContext called", context.name);
    // loop over context's conversationHistory and send each message to onSend  
    context.conversationHistory && processConversationHistory( context.conversationHistory);
   //  onSend(`You: ${messageText} \n ${response.data}`);
    storeContext(context)
  }

  const handleShowFile = (documents: string[]) => {
    console.log("handleShowFile called", documents);
  }

return (
<>
  <div className={`sidebar ${isOpen ? 'open' : ''}`}>
    <div className="sidebar-header">
        <h3>API Management</h3>

      {/* Displaying grouped contexts */}
      
      {groupedContexts && 
      <div>
        <h3>My Previous Contexts</h3>
        {Object.entries(groupedContexts).map(([date, contexts]) => (
          <div key={date}>
            <h4>{date}</h4>
            <ul>
              {contexts.map((context, id) => (
                <li key={id} style={{ cursor: 'pointer' }}>
                  <div className='hover-file-content-tooltip'  role="button" tabIndex={0}>
                  <span className={context.sessionId === getCookie('sessionId') ? 'green-text' : ''}>
                    {context.name}
                  </span>
                  
                     <AiOutlineAccountBook 
                        className="delete-file-icon" // Descriptive class name
                        onClick={() => handleShowContext(context)}
                      />
                  
                    <AiOutlineDelete 
                        className="delete-file-icon" 
                        onClick={() => handleRemoveFile(context.name)}
                    />
                    
                    {context.documents &&  

                      <div className="file-content-tooltip2">
                        {context.documents.join("\n ----- Next Document------ \n")}
                      </div>
                    
                    }
                  </div> 
                </li>
              ))}
            </ul>

          </div>
        ))}
      </div>
      }
    <h3> API Keys management </h3>
     {/*<li><a href="#add-api" onClick={navigateToAddAPI}>Add a new API key</a></li>*/}
      <li><a href="#share-api">Share my API keys</a></li>
    <h3> Billing</h3>
      <ul>
              
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
            {user?.lastLogin && <p><i className="fa fa-envelope icon"></i> {user.email}</p>}
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


