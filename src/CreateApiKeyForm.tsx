import React, { useState } from 'react';
import { ApiKey } from './models/ApiKey';

interface CreateApiKeyFormProps {
  onCreate: (apiKey: ApiKey) => void;
}

const CreateApiKeyForm: React.FC<CreateApiKeyFormProps> = ({ onCreate }) => {
  const [apiKey, setApiKey] = useState<ApiKey>({
    keyId: '',
    keyValue: '',
    name: '',
    uri: '',
    homepage: '',
    userId: '',
    maxContextLength: 0, // Max context length
    totalCost: 0,
    publicAccessed: false,
    defaultKey: true,
    model: '',
    description: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey({
      ...apiKey,
      [e.target.name]: e.target.name === 'totalCost' ? parseFloat(e.target.value) : e.target.value
    });
  };

  const handleSubmit = () => {
    onCreate(apiKey);
  };

  return (
    <div>
      <h2>Create API Key</h2>
      <input
        type="text"
        name="keyId"
        value={apiKey.keyId}
        onChange={handleInputChange}
        placeholder="Key ID"
      />
      <input
        type="text"
        name="keyValue"
        value={apiKey.keyValue}
        onChange={handleInputChange}
        placeholder="Key Value"
      />
      <input
        type="text"
        name="name"
        value={apiKey.name}
        onChange={handleInputChange}
        placeholder="Name"
      />
      <input
        type="text"
        name="uri"
        value={apiKey.uri}
        onChange={handleInputChange}
        placeholder="URI"
      />
      <input
        type="text"
        name="homepage"
        value={apiKey.homepage}
        onChange={handleInputChange}
        placeholder="Homepage"
      />
      <input
        type="text"
        name="userId"
        value={apiKey.userId}
        onChange={handleInputChange}
        placeholder="User ID"
      />
      <input
        type="number"
        name="totalCost"
        value={apiKey.totalCost}
        onChange={handleInputChange}
        placeholder="Total Cost"
      />
      <button onClick={handleSubmit}>Create API Key</button>
    </div>
  );
};

export default CreateApiKeyForm;