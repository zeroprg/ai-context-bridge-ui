import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { API_URLS } from '../apiConstants'; // Adjust the import path as needed

import {  getCookie, getToken } from '../auth';

// Define the shape of your user data
interface User {
  id: string; // Unique identifier
  name: string; // User's name
  email: string; // User's email
  recentApiId: string; // ID of the most recently used API
  lastLogin: Date; // Last login date
  pictureLink: string; // Link to picture icon
  clientId: string; // ClientId linked to client (company profile)
  roles: Set<string>; // User's roles as strings
}


interface UserContextProps {
  user: User | null;
  error: string | null;
  getUserInfo: () => void;
}

// Create the context with a default value
const UserContext = createContext<UserContextProps>({
  user: null,
  error: null,
  getUserInfo: () => {},
});

// Export the provider and consumer for ease of use
export const UserProvider = UserContext.Provider;
export const useUser = () => useContext(UserContext);



// Define a component that fetches user info and provides it to the context
export const UserProviderComponent: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const LOGIN_PAGE_PATH = '/'; // Replace with the path of your login page

  const getUserInfo = async () => {
    try {
      const response = await axios.get(API_URLS.GetUserInfo, { withCredentials: true });
      setUser(response.data);
      setError(null);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      setError('Error: ' + message);
      setTimeout(() => setError(null), 5000);
      navigate(LOGIN_PAGE_PATH); // Redirect to the login page
    }
  };
  

  useEffect(() => {
    if( !getCookie('sessionId')) 
      navigate(LOGIN_PAGE_PATH); // Redirect to the login page if the user is not logged in
    else { 
      // Get the token from the cookie
      const token = getToken();
      // Set the token as a default header for all axios requests
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      getUserInfo(); // Fetch user info when the component mounts
    }
  }, []);

  return (
    <UserProvider value={{ user, error, getUserInfo }}>
      {children}
    </UserProvider>
  );
};
