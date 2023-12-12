import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

import { ApiKey } from './models/ApiKey';
import './API.css';
import APIKeyGrid from './APIKeyGrid';
import { API_URLS } from './apiConstants';
import { getToken } from './auth';
import MessageBar from './components/MessageBar';
import OutputPanel from './components/OutputPanel';
import { useError } from './ErrorContext';
import { error } from 'console';


const API: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const { setError } = useError();
  const [selectedApiKey, setSelectedApiKey] = useState<string>('');
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
      }).catch(error => {console.error('Error running API:', error); setError('Error running API '+ error.response.data.meessage); });
  };

  /* for grabbing API keys */
  useEffect(() => {
    // Get the token from the cookie
    const token = getToken();
    // Set the token as a default header for all axios requests
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    // Fetch the list of API keys on component mount using axios
    console.log(`${API_URLS.GetApiKeys} will be  called`);
    axios.get(API_URLS.GetApiKeys, {withCredentials: true}).then(response => 
          setApiKeys(response.data))
        .catch(error => { console.error('Error:', error); setError('Error fetching API keys '); setTimeout(() => setError(null), 5000); })
    }, [location]);

  const selectApiKey = async (apiKey: string) => {
    try{     
      const response = await axios.put(API_URLS.SelectAPI(apiKey), null, { withCredentials: true})
      setSelectedApiKey(apiKey);
      console.log(response);
    } catch (error) {
      console.error('Error sending message:', error);
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
