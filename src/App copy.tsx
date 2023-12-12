import React, { useState, useEffect } from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import API from './API';

function App() {
  const initialUserProperties = {
    access_token: '',
    expires_in: 0,
    scope: '',
    token_type: '',
  };

  const emailUserProfile = {
    email: '',
    family_name: '',
    given_name: '',
    hd: '',
    id: '',
    locale: '',
    name: '',
    picture: '',
    verified_email: false,
  };

  const [emailUser, setEmailUser] = useState(initialUserProperties);
  const [emailProfile, setEmailProfile] = useState(emailUserProfile);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      // Extract necessary properties from tokenResponse and update emailUser state
      const { access_token, expires_in, scope, token_type } = tokenResponse;
      setEmailUser({ access_token, expires_in, scope, token_type });
      setIsLoggedIn(true);
    },
    onError: (error) => {console.log('Login Failed:', error) ; setIsLoggedIn(false)},
  });

  useEffect(() => {
    if (!!emailUser.access_token) {
      axios
        .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${emailUser.access_token}`, {
          headers: {
            Authorization: `Bearer ${emailUser.access_token}`,
            Accept: 'application/json',
          },
        })
        .then((res) => {
          setEmailProfile(res.data);
        })
        .catch((err) => console.log('err: ', err));

        localStorage.setItem('oauthToken', emailUser.access_token);  
    }
  }, [emailUser]);

  // Log out function to log the user out of Google and reset the profile state
  const logOut = () => {
    googleLogout();
    setEmailProfile(emailUserProfile); // Reset emailProfile state
  };
  console.log(process.env.REACT_APP_API_BASE_URL);
  if (isLoggedIn) {
    return <API />; // Render the API component when the user is logged in
  }

  return (
    <div>
      <h2>React Google Login</h2>
      <br />

      {emailProfile.email ? (
        <div>
          <img src={emailProfile.picture} alt="user" />
          <h3>Hurray! We have got the user profile.</h3>

          <div>
            <p>Name: {emailProfile.name}</p>
            <p>Email Address: {emailProfile.email}</p>
          </div>

          <br />
          <button onClick={logOut}>Log out</button>
        </div>
      ) : (
        <button onClick={() => login()}>Sign in with Google 🚀</button>
      )}
    </div>
  );
}

export default App;
