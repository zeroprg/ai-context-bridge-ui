// App.js
import React,{useState} from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import API from './API';
import './App.css';
import {UserProviderComponent} from './components/UserContext';
import Layout from './components/Layout';
import AddAPI from './components/AddAPI';
import ErrorBoundary from './components/ErrorBoundary';
import PaymentSuccess from './components/PaymentSuccess';
import { initiateGoogleOAuth } from './auth';

const App = () => {
    const [message, setMessage] = useState('');

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
