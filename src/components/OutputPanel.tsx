import React, { useState, useEffect } from 'react';
import axios from 'axios';

import './OutputPanel.css';
import CopyableCodeBlock from './CopyableCodeBlock';
import { API_URLS } from '../apiConstants';
import { useError } from '../ErrorContext';
import useSandingBox from './hooks/useSandingBox';
import SandingBox from './SandingBox';


type OutputPanelProps = {
  message: string;
  logMessage: string;
};
const ADDITIONAL_PROMPT="Draw it as HTML table.";

const OutputPanel: React.FC<OutputPanelProps> = ({ message, logMessage}) => {
  const { isLoading, setIsLoading, mousePosition } = useSandingBox();

  const { handleError } = useError();
  const [accumulatedMessages, setAccumulatedMessages] = useState<string>('');
  const [accumulatedCode, setAccumulatedCode] = useState<string>('');
  const [hiddenElements, setHiddenElements] = useState<Set<number>>(new Set());

  const handleDoubleClick = (fragment: string, index: number) => {
    setAccumulatedCode(prevCode => prevCode + '\n' + fragment);
    setHiddenElements(prevSet => new Set(prevSet).add(index));
  };

  const handlePromptBttnClick = async (prompt: string) => {
    setIsLoading(true);
    try {      
        const response = await axios.post(API_URLS.CustomerQuery, { data: prompt }, { withCredentials: true });
        setAccumulatedMessages(prev => prev + '\nYou: ' + prompt + '\n' + response.data);
    } catch (error: any) {
        handleError('' + error + ' ' + error.response?.data.message, error);
    } finally {
        setIsLoading(false);
    }   
  }  

  const formatText = (text: string): JSX.Element[] => {
    if (text === '$clearOutputPanel') {
      setAccumulatedMessages('');
      return [];
    }
  
    // Update the regex to include table pattern
    //const complexRegex = /(```[\s\S]*?```)|(\n)|(^>>>.*$)|(^#!.*$)|(^\|.*?\|$(?:\n^\|.*?\|$)*)/gm;
    const complexRegex = /(```[\s\S]*?```)|(\n)|(^>>>.*$)|(^#!.*$)|(^\|.*?\|$(?:\n^\|.*?\|$)*)|(<table>[\s\S]*?<\/table>)|(<body>[\s\S]*?<\/body>)|(<prompts>[\s\S]*?<\/prompts>)/gm;

      //  const dateTimeRegex = /^\d{2}:\d{2}:\d{2}/;
    
    const elements = text.split(complexRegex).map((fragment, index) => {
      if (!fragment || hiddenElements.has(index)) return null;
      const isAIPrompts = fragment.startsWith('<prompts>');
      const isUserPrompt = fragment.startsWith('You:');
      const isCodeBlock = fragment.startsWith('>>>') || fragment.startsWith('#!');
      const isBacktickCode = fragment.startsWith('```') && fragment.endsWith('```');
      const isNewLine = fragment === '\n';
      //const isLog = dateTimeRegex.test(fragment);
      const isTable = fragment.trim().startsWith('|') && fragment.trim().endsWith('|');
      //const isHTMLTable = (fragment.trim().startsWith('<table>') && fragment.trim().endsWith('</table>')) || (fragment.trim().startsWith('<body>') && fragment.trim().endsWith('</body>'));
      const isHTMLTable = /<(table|body)>[\s\S]*<\/\1>/.test(fragment.trim());
  
      if (isUserPrompt) {
        return <p key={index} className="user-prompt">{fragment}</p>;
      } 
      else if (isAIPrompts) {
          const lines = fragment.replace(/^<prompts>/, "").replace(/<\/prompts>$/, "").split('\n');
          lines.push(ADDITIONAL_PROMPT);
          return (
              <p key={index}>
                {lines.map((line, idx) => {
                  const trimmedLine = line.trim();
                  if (trimmedLine.length > 0) {
                    return (                                        
                        <button key={idx}
                          onClick={() => handlePromptBttnClick(trimmedLine)}
                          className="link-button"
                        >
                          {trimmedLine}
                        </button>                  
                    );
                  }
                  return null;
                })}
              </p>
            );
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
      } else if(isHTMLTable){
        const sanitizedHtml = fragment.replace(/<body>/g, "<div>")
        .replace(/<\/body>/g, "</div>")
        .replace(/^html\s+/, '');
        return (
            <CopyableCodeBlock key={index}>{sanitizedHtml}</CopyableCodeBlock>
          );
      } else if (isNewLine) {
        return null;
      } else {
        return <p key={index} onDoubleClick={() => handleDoubleClick(fragment,index)}>{fragment}</p>;
      }
    });
  
    return [
      ...elements,
      accumulatedCode && <CopyableCodeBlock key="accumulated">{accumulatedCode}</CopyableCodeBlock>
    ].filter((element): element is JSX.Element => element !== null);
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
    <>
    {isLoading && <SandingBox mousePosition={mousePosition} />}
    <div className="output-panel">
      {message || logMessage ? formatText(accumulatedMessages) : null}
    </div>
    </>
  );


};

export default OutputPanel;
