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


const API: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const { user } = useUser();
  const { handleError } = useError();
 
  const [selectedApiKey, setSelectedApiKey] = useState<string>(user?.recentApiId || '');
  const [queryResult, setQueryResult] = useState<string>('');
  const location = useLocation();
  /* for working with Message Bar */
  const [messageText, setMessageText] = useState(''); // Define the messageText state

  // Define a function to handle sending the message
  const handleSendMessage = (message: string) => {
      // Implement the logic to send the message, e.g., using Axios
          // Set the entered message to the state.
      setMessageText(message);
      axios.get(API_URLS.CustomerQuery, {withCredentials: true}).then(response => {
        setQueryResult(JSON.stringify(response.data, null, 2));
      }).catch(error => {console.error('Error running API:', error); handleError('Error running API '+ error.response.data.meessage); });
  };

  /* for grabbing API keys */
  useEffect(() => {
    //setSelectedApiKey(user?.recentApiId || '');
    // Fetch the list of API keys on component mount using axios
    console.log(`${API_URLS.GetApiKeys} will be  called`);
    axios.get(API_URLS.GetApiKeys, {withCredentials: true}).then(response => 
          setApiKeys(response.data))
        .catch(error => {handleError('Error fetching API keys ',error);  })
    }, [location]);

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

  return (
<div className="api-container">
    {/* ... Existing code for creating and displaying API keys ... */}
    <div className="api-key-grid-container">
        <APIKeyGrid 
            apiKeys={apiKeys} 
            keySelectedId={selectedApiKey}
            onRowSelected={onRowSelected}
        />
    </div>
    <div className="api-container">
      <OutputPanel text={queryResult} />         
      <MessageBar message={messageText} onSend={handleSendMessage} />

    </div>


</div>

  );
}

export default API;
