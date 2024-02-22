// Home.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getCookie } from './auth';
import { Footer } from './content/components';
import  ModeSwitch  from './components/ModeSwitch';
import "./App.css"
import "./home.css"
const Home = ({ initiateGoogleOAuth }) => {
    /* Theme toggling */
    
    const [showLanguagePopup, setShowLanguagePopup] = useState(false); // State for showing/hiding the popup




    /* Authentication and navigation*/
    const navigate = useNavigate();    

    const aboutLink = process.env.REACT_APP_DEV_DOC_SITE || 'http://tothemoon.chat';

    const handleRunButtonClick = () => {
        navigate('/api');
    };

    // Language options
    const LANGUAGES = [
        { label: "Automatic/default (Whisper ASR)", code: "auto" },
        { label: "Afrikaans", code: "af" },
        { label: "Arabic", code: "ar" },
        { label: "Armenian", code: "hy" },
        { label: "Azerbaijani", code: "az" },
        { label: "Belarusian", code: "be" },
        { label: "Bosnian", code: "bs" },
        { label: "Bulgarian", code: "bg" },
        { label: "Catalan", code: "ca" },
        { label: "Chinese", code: "zh" },
        { label: "Croatian", code: "hr" },
        { label: "Czech", code: "cs" },
        { label: "Danish", code: "da" },
        { label: "Dutch", code: "nl" },
        { label: "English", code: "en" },
        { label: "Estonian", code: "et" },
        { label: "Finnish", code: "fi" },
        { label: "French", code: "fr" },
        { label: "Galician", code: "gl" },
        { label: "German", code: "de" },
        { label: "Greek", code: "el" },
        { label: "Hebrew", code: "he" },
        { label: "Hindi", code: "hi" },
        { label: "Hungarian", code: "hu" },
        { label: "Icelandic", code: "is" },
        { label: "Indonesian", code: "id" },
        { label: "Italian", code: "it" },
        { label: "Japanese", code: "ja" },
        { label: "Kannada", code: "kn" },
        { label: "Kazakh", code: "kk" },
        { label: "Korean", code: "ko" },
        { label: "Latvian", code: "lv" },
        { label: "Lithuanian", code: "lt" },
        { label: "Macedonian", code: "mk" },
        { label: "Malay", code: "ms" },
        { label: "Marathi", code: "mr" },
        { label: "Maori", code: "mi" },
        { label: "Nepali", code: "ne" },
        { label: "Norwegian", code: "no" },
        { label: "Persian", code: "fa" },
        { label: "Polish", code: "pl" },
        { label: "Portuguese", code: "pt" },
        { label: "Romanian", code: "ro" },
        { label: "Russian", code: "ru" },
        { label: "Serbian", code: "sr" },
        { label: "Slovak", code: "sk" },
        { label: "Slovenian", code: "sl" },
        { label: "Spanish", code: "es" },
        { label: "Swahili", code: "sw" },
        { label: "Swedish", code: "sv" },
        { label: "Tagalog", code: "tl" },
        { label: "Tamil", code: "ta" },
        { label: "Thai", code: "th" },
        { label: "Turkish", code: "tr" },
        { label: "Ukrainian", code: "uk" },
        { label: "Urdu", code: "ur" },
        { label: "Vietnamese", code: "vi" },
        { label: "Welsh", code: "cy" },
    ];

    const handleLanguageChange = (selectedLanguage) => {
        // Handle language change logic here
        // Implement your language switching logic (e.g., update state, fetch translations, etc.)
        console.log(`Selected language: ${selectedLanguage}`);
        setShowLanguagePopup(false); // Close the popup after language selection
    };

    return (
        
        <main className="App">
            <header className="App-header">
                <h1>Welcome to ToTheMoon Chat to documents</h1>
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
                
                <img src="/logo512.png" alt="Logo" />
                <p>Your enterprise solution for document processing by chatting to it in your native language
                <div>
                    <button className="language-toggle-button" onClick={() => setShowLanguagePopup(true)}>
                        Language
                    </button>
                    {showLanguagePopup && (
                        <div className="language-popup">
                            {LANGUAGES.map(({ code, label }) => (
                                <button
                                    key={code}
                                    onClick={() => handleLanguageChange(code)}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                </p>
                <p>
                    Working with document's formats: .docx, .pdf, .xlsx, .csv , All image formats: .jpg, .png,.. and audio formats: .webm, .ogg, .mp4, .flac, .m4a, .mp3, .mpeg, .mpga, .wav      
                    <a href={aboutLink} target="_blank" rel="noopener noreferrer" className="about-link"> Reference to technical details</a>
                </p>
                <ModeSwitch/>
             </header>
            <Footer />
        </main>
    );
};

export default Home;