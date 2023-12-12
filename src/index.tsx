import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { ErrorProvider } from './ErrorContext';
import ErrorDisplay from './ErrorDisplay';
import './App.css';

ReactDOM.render(
    <ErrorProvider>
        <ErrorDisplay />
        <App />
    </ErrorProvider>        
,
    document.getElementById('root')
);