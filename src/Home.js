// Home.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { getCookie } from './auth';
import { Footer } from './content/components';
import "./App.css"
import "./home.css"
const Home = ({ initiateGoogleOAuth }) => {
    /* Theme toggling */
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    /* Authentication and navigation*/
    const navigate = useNavigate();    

    const aboutLink = process.env.REACT_APP_DEV_DOC_SITE || 'http://tothemoon.chat';

    const handleRunButtonClick = () => {
        navigate('/api');
    };

    return (
        
        <main className="App">
            <header className="App-header">
                <h1>Welcome to ToTheMoon Chat to documents</h1>
                
                <img src="/logo512.png" alt="Logo" />
                <p>Your enterprise solution for document processing by chatting to it</p>
                <p>
                    Working with document's formats: .docx, .pdf, .xlsx, .csv , All image formats: .jpg, .png,.. and audio formats: .webm, .ogg, .mp4, .flac, .m4a, .mp3, .mpeg, .mpga, .wav      
                    <a href={aboutLink} target="_blank" rel="noopener noreferrer" className="about-link"> Reference to technical details</a>
                </p>

                <div>
                    <button className="theme-toggle-button" onClick={toggleTheme}>
                        {theme === 'light' ? 'Dark' : 'Light'} Mode
                    </button>
                </div>
                <div>
                    {getCookie('sessionId')? (
                        <button className="google-login-button" onClick={handleRunButtonClick}>Run</button>
                    ) : (
                        <button className="google-signin-btn" onClick={initiateGoogleOAuth}>
                            <div className="google-signin-btn-icon-wrapper">
                                <img className="google-signin-btn-icon" src="https://developers.google.com/identity/images/g-logo.png" alt="Google sign-in" />
                            </div>
                        <span className="google-signin-btn-text">Continue with Google</span>
                        </button>
                    )}
                </div>
            </header>
            <Footer />
        </main>
    );
};

export default Home;
