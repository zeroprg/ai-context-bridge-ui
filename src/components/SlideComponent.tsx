import React, { useState, useEffect, CSSProperties } from 'react';

import axios from 'axios';
import { AiOutlineAccountBook, AiOutlineDelete } from 'react-icons/ai';

//import './MessageBar.css'; // Make sure this CSS file exists
import { FaArrowLeft, FaArrowRight, FaUser, FaCreditCard, FaEnvelope } from 'react-icons/fa'; // Import icons

import { useUser } from './UserContext';
import { storeContext } from "../utils/llama";
import './SlideComponent.css';
import { Context } from '../models/Context';
import { API_URLS } from '../apiConstants';
import { useError } from '../ErrorContext';
import { getCookie } from '../auth';
import StripePaymentComponent from './StripePaymentComponent';

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

  const toggleButtonStyle: CSSProperties = {
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

  const processConversationHistory = (conversationHistoryStr: string) => {
    if (conversationHistoryStr) {
      try {
        const conversationHistory = JSON.parse(conversationHistoryStr);
        let assistantRole = 'Bot';
        if (Array.isArray(conversationHistory)) {
          let messageText = '';
          conversationHistory.forEach(message => {

            if (message.role === 'system') {
              assistantRole = message.content;

            } else {
              if (message.role === 'assistant') messageText += `${assistantRole}: ${message.content}\n`;
              else if (message.role === 'user') messageText += `You: ${message.content}\n`;

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
    axios.delete(API_URLS.DeleteFileFromContext(fileName), { withCredentials: true }).then(response => {
      setUser(response.data);
    })
      .catch(error => { handleError('' + error + ' ' + error.response?.data.message, error); })
  }

  const handleShowContext = (context: Context) => {
    console.log("handleShowContext called", context.name);
    // loop over context's conversationHistory and send each message to onSend  
    context.conversationHistory && processConversationHistory(context.conversationHistory);
    //  onSend(`You: ${messageText} \n ${response.data}`);
    storeContext(context)
  }

  const handleShowFile = (documents: string[]) => {
    console.log("handleShowFile called", documents);
  }
  const updateUserCredit = (amountPaid: number) => {
    if (user) {
      const updatedUser = { ...user, credit: user.credit - amountPaid };
      setUser(updatedUser);
    }
  };

  const handlePaymentConfirmation = (sessionId: string, amountPaid: number) => {
    console.log('Payment confirmed for session:', sessionId);
    // Since we're simulating without a server, we'll assume the session ID is valid
    // In a real application, this should be verified server-side
    const isSessionValid = true; // Placeholder for actual validation
    if (isSessionValid) {
      // Update user interface or state to reflect the successful payment
      updateUserCredit(amountPaid);
      // Any other client-side updates based on the assumed successful payment
    } else {
      // Handle the case where session ID is not valid
      console.error('Payment session could not be verified');
    }
  };


  return (
    <>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}>
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
                        <div className='hover-file-content-tooltip' role="button" tabIndex={0} title="Click it to select as current context">
                          <span className={context.sessionId === getCookie('sessionId') ? 'green-text' : ''}>
                            {context.name}
                          </span>

                          <AiOutlineAccountBook
                            className="delete-file-icon" title="Click it to show chat history"
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


        </div>

        <div className="sidebar-menu">

        </div>

        <div className="sidebar-footer">
          {/* Footer Content Here, if any */}
          <div className="user-info">

            {user?.pictureLink && <img src={user.pictureLink} alt={user.name} className="user-picture" />}
            <div className="user-details">
              {user?.name && <p title="User's E-mail"><FaUser className="delete-file-icon" /> {user.name}</p>}
              {user?.credit && <p title='Credit balance'><FaCreditCard className="delete-file-icon" /> {user.credit}$</p>}
              {user?.lastLogin && <p title="User's icon"><FaEnvelope className="delete-file-icon" /> {user.email}</p>}

            </div>
            <StripePaymentComponent amount={1}/>
            <StripePaymentComponent amount={3}/>
            <StripePaymentComponent amount={10}/>
          </div>

        </div>
      </div>
      <div style={toggleButtonStyle} onClick={toggleOpen} title={buttonHint}>
        {isOpen ? <FaArrowLeft size={30} /> : <FaArrowRight size={30} />}
      </div>
    </>
  );
};

export default SlideComponent;


