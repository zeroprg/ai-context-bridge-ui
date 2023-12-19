  
import React, { useState, FormEvent } from 'react';
import axios from 'axios';
import { ApiKey } from '../models/ApiKey';
import './AddAPI.css'; // Assuming you have a CSS file for styles
import { useUser } from './UserContext';
import { API_URLS } from '../apiConstants';

const AddAPI: React.FC = () => {
  const { user } = useUser();
  const [apiKey, setApiKey] = useState<ApiKey>({
    keyId: '',
    keyValue: '',
    name: '',
    uri: '',
    homepage: '',
    userId: '',
    totalCost: 0,
    publicAccessed: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target;
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    setApiKey({
      ...apiKey,
      [target.name]: value,
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Implement API submission logic here
    //apiKey.userId = user.id;
    axios.post(API_URLS.CreateApiKey, apiKey)
      .then(response => {
        console.log(response.data);
        // Handle success here (e.g., showing a success message, redirecting, etc.)
      })
      .catch(error => {
        console.error("Error adding API key:", error);
        // Handle error here (e.g., showing an error message)
      });
  };

  return (
    <div className="add-api-container">
  
      <form onSubmit={handleSubmit} className="api-form">
          {/*   <div className="form-group">
          <label htmlFor="keyId">Key ID:</label>
          <input id="keyId" name="keyId" value={apiKey.keyId} onChange={handleChange} />
        </div>
        */}
        <div className="form-group">
          <label htmlFor="keyValue">API Key Value:</label>
          <input id="keyValue" name="keyValue" value={apiKey.keyValue} onChange={handleChange} />
        </div>
        {/* Add other fields in similar fashion */}
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input id="name" name="name" value={apiKey.name} onChange={handleChange} />
        </div>
        {/* ... other fields ... */}
        <div className="form-group">
          <label htmlFor="publicAccessed">Accessed to public:</label>
          <input type="checkbox" id="publicAccessed" name="publicAccessed" checked={apiKey.publicAccessed} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="uri">URI:</label>
          <input id="uri" name="uri" value={apiKey.uri} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="homepage">Homepage:</label>
          <input id="homepage" name="homepage" value={apiKey.homepage} onChange={handleChange} />
        </div>
        <input type="hidden" id="userId" name="userId" value={user?.id} />

          {/*
        <div className="form-group">
          <label htmlFor="userId">User ID:</label>
          <input id="userId" name="userId" value={apiKey.userId} onChange={handleChange} />
        </div>
        
       ... other fields ... 
        <div className="form-group">
          <label htmlFor="totalCost">Total Cost:</label>
          <input type="number" id="totalCost" name="totalCost" value={apiKey.totalCost} onChange={handleChange} />
        </div>
       */}

        <button type="submit" className="submit-btn">Add API Key</button>
      </form>
    </div>
  );
};

export default AddAPI;

  