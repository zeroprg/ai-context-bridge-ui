// Home.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCookie } from './auth';

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


    const handleRunButtonClick = () => {
        navigate('/api');
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Welcome to ToTheMoon Chat</h1>
                <p>Your enterprise solution for document processing and analysis...</p>
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
        </div>
    );
};

export default Home;
