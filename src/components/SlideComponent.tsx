import React, { useState, useEffect, CSSProperties } from 'react';
import axios from 'axios';
import { MdMenu, MdClose, MdChatBubbleOutline, MdDeleteOutline } from 'react-icons/md';
import { FaUser, FaCreditCard, FaEnvelope } from 'react-icons/fa';
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
  const [groupedContexts, setGroupedContexts] = useState<Record<string, Context[]>>({});
  const { handleError } = useError();
  const [isOpen, setIsOpen] = useState(false);
  const [buttonHint, setButtonHint] = useState("More info");

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    setButtonHint(isOpen ? "More info" : "Hide Info");
  };

  // Added to close the sidebar explicitly (for mobile or on context selection)
  const closeSidebar = () => {
    setIsOpen(false);
    setButtonHint("More info");
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  useEffect(() => {
    const contexts: Record<string, Context> = (user as any)?.contexts || {};
    const groups: Record<string, Context[]> = {};
    Object.values(contexts).forEach((context) => {
      const dateKey = context.lastUsed ? formatDate(new Date(context.lastUsed)) : 'Unknown';
      groups[dateKey] = groups[dateKey] || [];
      groups[dateKey].push(context);
    });
    setGroupedContexts(groups);
  }, [user]);

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
              if (message.role === 'assistant')
                messageText += `${assistantRole}: ${message.content}\n`;
              else if (message.role === 'user')
                messageText += `You: ${message.content}\n`;
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
    axios.delete(API_URLS.DeleteFileFromContext(fileName), { withCredentials: true })
      .then(response => { setUser(response.data); })
      .catch(error => { handleError('' + error + ' ' + error.response?.data.message, error); });
  };

  // When a context is selected, show it and then close the sidebar.
  const handleShowContext = (context: Context) => {
    console.log("handleShowContext called", context.name);
    if (context.conversationHistory) {
      processConversationHistory(context.conversationHistory);
    }
    storeContext(context);
    closeSidebar(); // Close sidebar upon selection.
  };

  const updateUserCredit = (amountPaid: number) => {
    if (user) {
      const updatedUser = { ...user, credit: user.credit - amountPaid };
      setUser(updatedUser);
    }
  };

  const handlePaymentConfirmation = (sessionId: string, amountPaid: number) => {
    console.log('Payment confirmed for session:', sessionId);
    const isSessionValid = true;
    if (isSessionValid) {
      updateUserCredit(amountPaid);
    } else {
      console.error('Payment session could not be verified');
    }
  };

  return (
    <>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}
           onMouseEnter={() => setIsOpen(true)}
           onMouseLeave={() => setIsOpen(false)}>
        <div className="sidebar-header">
          {/* Mobile close button, visible only on small screens */}
          <div className="mobile-close-button">
            <button onClick={closeSidebar}>
              <MdClose size={24} />
            </button>
          </div>
          <h3>API Management</h3>
          {groupedContexts && Object.keys(groupedContexts).length > 0 && (
            <div className="contexts-section">
              <h3>My Previous Contexts</h3>
              {Object.entries(groupedContexts).map(([date, contexts]) => (
                <div key={date} className="context-group">
                  <h4>{date}</h4>
                  <div className="contexts-list">
                    {contexts.map((context, id) => (
                      <div key={id} className="context-card">
                        <div className="context-details"
                             title="Click to view context"
                             onClick={() => handleShowContext(context)}>
                          <span className={context.sessionId === getCookie('sessionId') ? 'green-text' : ''}>
                            {context.name}
                          </span>
                          {context.conversationHistory && (
                            <p className="context-snippet">
                              {(() => {
                                try {
                                  const parsed = JSON.parse(context.conversationHistory);
                                  if (Array.isArray(parsed) && parsed.length > 0) {
                                    const snippet = parsed.map((msg: any) => msg.content).join(' ');
                                    return snippet.substring(0, 50) + '...';
                                  }
                                } catch (error) {
                                  return '';
                                }
                                return '';
                              })()}
                            </p>
                          )}
                        </div>
                        <div className="context-actions">
                          <MdChatBubbleOutline className="context-icon" title="View chat history" onClick={() => handleShowContext(context)} />
                          <MdDeleteOutline className="context-icon" title="Delete context" onClick={() => handleRemoveFile(context.name)} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          <h3>API Keys Management</h3>
          <ul>
            <li><a href="#share-api">Share my API keys</a></li>
          </ul>
        </div>

        <div className="sidebar-menu">
          {/* Additional sidebar menu content */}
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            {user?.pictureLink && <img src={user.pictureLink} alt={user.name} className="user-picture" />}
            <div className="user-details">
              {user?.name && <p title="User's E-mail"><FaUser className="context-icon" /> {user.name}</p>}
              {user?.credit && <p title="Credit balance"><FaCreditCard className="context-icon" /> {user.credit}$</p>}
              {user?.email && <p title="User's email"><FaEnvelope className="context-icon" /> {user.email}</p>}
            </div>
            <div className="payment-section">
              <StripePaymentComponent amount={1} />
              <StripePaymentComponent amount={3} />
              <StripePaymentComponent amount={10} />
            </div>
          </div>
        </div>
      </div>

      <div className="toggle-button" onClick={toggleOpen} title={buttonHint}>
        {isOpen ? <MdClose size={30} /> : <MdMenu size={30} />}
      </div>
    </>
  );
};

export default SlideComponent;