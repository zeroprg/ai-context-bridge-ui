// Home.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { getCookie } from './auth';
import { Footer } from './content/components';

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
                <h1>Welcome to ToTheMoon Chat</h1>
                
                <img src="/logo512.png" alt="Logo" />
                <p>Your enterprise solution for document processing and analysis...</p>
                <p>
                    Working with *.doc,*.pdf,*.wml,*.wave, etc...      
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
                        <button className="google-login-button" onClick={initiateGoogleOAuth}>
                            Login with Google
                        </button>
                    )}
                </div>
            </header>
            <Footer />
        </main>
    );
};

export default Home;
