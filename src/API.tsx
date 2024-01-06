import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

import { ApiKey } from './models/ApiKey';

import './API.css';

import APIKeyGrid from './APIKeyGrid';
import { API_URLS } from './apiConstants';
import MessageBar from './components/MessageBar';
import OutputPanel from './components/OutputPanel';
import { useUser } from './components/UserContext';
import { useError } from './ErrorContext';
import ChatGPTIndicator from './components/ChatGPTIndicator';

interface APIProps {
  message: string;
}

const API: React.FC<APIProps> = ({ message }) => {

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const { user } = useUser();
  const { handleError } = useError();
 
  const [selectedApiKey, setSelectedApiKey] = useState<string>(user?.recentApiId || '');
  const [queryResult, setQueryResult] = useState<string>('');
  const [APIGridOpen, setAPIGridOpen] = useState<boolean>(true);
  const location = useLocation();
  /* for working with Message Bar */
  const [prompt] = useState('');
  const [logMessage, setlogMessage] = useState('');

    // Define a function to handle sending the message
  const handleQueryResult = (message: string) => { 
      // Set the entered message to the state.
      setAPIGridOpen(false);
      setQueryResult(message);
      setlogMessage('');
  };

    // Use the message prop as needed
    React.useEffect(() => {
      if (message) {
        console.log("Received message:", message);
        // Perform actions based on the message
        handleQueryResult(message);
      }
    }, [message]); // React to changes in the message prop

  const handleTechnicalMessage = (message: string) => { 
    /* handle logic to send technical message to OutputPanel  */  
    setlogMessage(message);
  }  

  
  /* for grabbing API keys */
  useEffect(() => {
    //setSelectedApiKey(user?.recentApiId || '');
    // Fetch the list of API keys on component mount using axios
    console.log(`${API_URLS.GetApiKeys} will be called`);
    axios.get(API_URLS.GetApiKeys, {withCredentials: true}).then(response =>{
            setApiKeys(response.data);
             })
        .catch(error => {handleError('Error fetching API keys ',error);  })
    if (user) {
      // Update selectedApiKey when user changes from null to not null
      setSelectedApiKey(user.recentApiId || '');
    }    
    }, [user, location]);

  const selectApiKey = async (apiKey: string) => {
    try{     
      const response = await axios.put(API_URLS.SelectAPI(apiKey), null, { withCredentials: true})
      setSelectedApiKey(apiKey);        
      console.log(response);
    } catch (error) {
      console.error('Error sending message:', error);
      handleError('Error fetching API keys ',error);
    }
  }; 

  const onRowSelected = (selectedRows: ReadonlySet<string>) => {
    // Example implementation: log the selected row keys
    console.log("Selected Rows:", Array.from(selectedRows));
    selectApiKey(Array.from(selectedRows)[0]); 
  };

  const getApiKeyById = (id: string): ApiKey => {
    return apiKeys.find((apiKey) => apiKey.keyId === id) ?? {} as ApiKey;
  };

  const handleMouseEnter = () => {
      setAPIGridOpen(true);
  };


  return (
    
  <div>
    { selectedApiKey && <ChatGPTIndicator apiKey={getApiKeyById(selectedApiKey)} onMouseEnter={handleMouseEnter} />}
    <div className="api-container">
    
    {/* ... Existing code for creating and displaying API keys ... */}
   { apiKeys && APIGridOpen &&
    <div className="api-key-grid-container">
        <APIKeyGrid 
            apiKeys={apiKeys} 
            keySelectedId={selectedApiKey}
            onRowSelected={onRowSelected}
        />
    </div>
    }
    <div className="api-container">
      <OutputPanel message={queryResult} logMessage={logMessage} />         
      <MessageBar message={prompt} onSend={handleQueryResult} onLogSend={handleTechnicalMessage} />

    </div>


    </div>
  </div>
  );
}

export default API;
