// App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import API from './API';
import './App.css';
import { BACKEND_REDIRECT_URI, CLIENT_ID } from './apiConstants';

const App = () => {
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

    return (
        <Router>
            <Routes>
                <Route path="/api" element={<API />} />
                <Route path="/" element={<Home initiateGoogleOAuth={initiateGoogleOAuth} />} />
                {/* Add other routes as needed */}
            </Routes>
        </Router>
    );
};

export default App;
