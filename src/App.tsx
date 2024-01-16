// App.js
import React,{useState} from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import API from './API';
import './App.css';
import { BACKEND_REDIRECT_URI, CLIENT_ID } from './apiConstants';
import {UserProviderComponent} from './components/UserContext';
import Layout from './components/Layout';
import AddAPI from './components/AddAPI';
import ErrorBoundary from './components/ErrorBoundary';
import PaymentSuccess from './components/PaymentSuccess';


const App = () => {
    const [message, setMessage] = useState('');

    const initiateGoogleOAuth = () => {
        const redirectUri = encodeURIComponent(BACKEND_REDIRECT_URI || "not founded in .env file");
        const scope = encodeURIComponent('email');
        const state = generateRandomString();
        const nonce = generateRandomString();
        const client_id = CLIENT_ID + ".apps.googleusercontent.com";
        const oauth2Url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${client_id}&scope=${scope}&state=${state}&redirect_uri=${redirectUri}&nonce=${nonce}`;
        window.location.href = oauth2Url;
    };

    const generateRandomString = () => {
        return Math.random().toString(36).substring(2, 15);
    };

    const handleQueryResult = (msg:string) => {
        console.log("Message received:", msg);
        setMessage(msg)
    };

    const handleSend = (msg:string) => {
        handleQueryResult(msg);
    };

    return (
        <React.StrictMode>
        <Router>
            <Routes>
              
                <Route path="/api" element={<ErrorBoundary><UserProviderComponent><Layout onSend={handleSend}> <API message={message}/> </Layout></UserProviderComponent></ErrorBoundary>} />
                <Route path="/" element={ <ErrorBoundary><Home initiateGoogleOAuth={initiateGoogleOAuth} /></ErrorBoundary> } />
                <Route path="/add-api" element={<UserProviderComponent><Layout onSend={handleSend}> <AddAPI/> </Layout></UserProviderComponent>} />
                <Route path="/payment-success" element={<ErrorBoundary><UserProviderComponent><Layout onSend={handleSend}> <PaymentSuccess/> </Layout></UserProviderComponent></ErrorBoundary>} />

                {/* Add other routes as needed */}
              
            </Routes>
        </Router>
        </React.StrictMode>
    );
};

export default App;
