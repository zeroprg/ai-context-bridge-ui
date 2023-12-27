import React, { useState, useEffect } from 'react';
import './OutputPanel.css';

type OutputPanelProps = {
  message: string;
  logMessage: string;
};

const OutputPanel: React.FC<OutputPanelProps> = ({ message, logMessage }) => {
  const [accumulatedMessages, setAccumulatedMessages] = useState<string>('');


  const formatText = (text: string): JSX.Element[] => {
    const complexRegex = /(`[^`]*`|'[^']*'|"[^"]*")|(\n)|(^>>>.*$)|(^#!.*$)/gm;
    const dateTimeRegex = /^\d{2}:\d{2}:\d{2}/;
    const elements = text.split(complexRegex).map((fragment, index) => {
      
        if (!fragment) return null;
        const isCodeBlock = fragment.startsWith('>>>') || fragment.startsWith('#!');
        const isBacktickCode = fragment.startsWith('`') && fragment.endsWith('`');
        const isNewLine = fragment === '\n';
        const isLog = dateTimeRegex.test(fragment);
        if (isCodeBlock || isBacktickCode) {
          return <code key={index} className={isLog ? 'log' : 'code-style'}>{fragment}</code>;
        } else if (isNewLine) {
          return null;
        } else {
          return <p key={index}>{fragment}</p>
        }      
    }); // This will return null values;
    // Filter out null values
    return elements.filter((element): element is JSX.Element => element !== null);
  };


  const getFormattedDateTime = () => {
    const now = new Date();
    return now.toISOString().replace('T', ' ').slice(11, 19);
  };

  useEffect(() => {
    const newLogMessage = logMessage ? `\`${getFormattedDateTime()} ${logMessage}\`` : '';
    const newMessage = message ? `${message}${newLogMessage}` : newLogMessage;
    setAccumulatedMessages(prev => prev + '\n' + newMessage);
  }, [message, logMessage]);

  return (
    <div className="output-panel">
      {message || logMessage ? formatText(accumulatedMessages) : null}
    </div>
  );


};

export default OutputPanel;
