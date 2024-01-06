import React, { useState, useEffect } from 'react';
import './OutputPanel.css';
import CopyableCodeBlock from './CopyableCodeBlock';

type OutputPanelProps = {
  message: string;
  logMessage: string;
};

const OutputPanel: React.FC<OutputPanelProps> = ({ message, logMessage }) => {
  const [accumulatedMessages, setAccumulatedMessages] = useState<string>('');



  const formatText = (text: string): JSX.Element[] => {
    if (text === '$clearOutputPanel') {
      setAccumulatedMessages('');
      return [];
    }
  
    // Update the regex to include table pattern
    const complexRegex = /(```[\s\S]*?```)|(\n)|(^>>>.*$)|(^#!.*$)|(^\|.*?\|$(?:\n^\|.*?\|$)*)/gm;
        const dateTimeRegex = /^\d{2}:\d{2}:\d{2}/;
    
    const elements = text.split(complexRegex).map((fragment, index) => {
      if (!fragment) return null;
  
      const isUserPrompt = fragment.startsWith('You:');
      const isCodeBlock = fragment.startsWith('>>>') || fragment.startsWith('#!');
      const isBacktickCode = fragment.startsWith('```') && fragment.endsWith('```');
      const isNewLine = fragment === '\n';
      //const isLog = dateTimeRegex.test(fragment);
      const isTable = fragment.trim().startsWith('|') && fragment.trim().endsWith('|');
  
      if (isUserPrompt) {
        return <p key={index} className="user-prompt">{fragment}</p>;
      } else if (isCodeBlock || isBacktickCode) {
        const codeContent = isBacktickCode ? fragment.slice(3, -3) : fragment;
        return <CopyableCodeBlock key={index}>{codeContent}</CopyableCodeBlock>
      } else if (isTable) {
        const rows = fragment.trim().split('\n').map(row => 
          row.split('|').slice(1, -1).map(cell => cell.trim())
        );
        return (
          <CopyableCodeBlock key={index}>
          <table key={`table-${index}`} >
            <thead>
              <tr>{rows[0].map((cell, cellIndex) => <th key={cellIndex}>{cell}</th>)}</tr>
            </thead>
            <tbody>
              {rows.slice(1).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
          </CopyableCodeBlock>
        );
      } else if (isNewLine) {
        return null;
      } else {
        return <p key={index}>{fragment}</p>;
      }
    });
  
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
  }, [message]);

  return (
    <div className="output-panel">
      {message || logMessage ? formatText(accumulatedMessages) : null}
    </div>
  );


};

export default OutputPanel;
