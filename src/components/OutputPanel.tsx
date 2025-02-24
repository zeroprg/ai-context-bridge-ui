import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './OutputPanel.css';
import CopyableCodeBlock from './CopyableCodeBlock';
import { API_URLS } from '../apiConstants';
import { useError } from '../ErrorContext';
import useSandingBox from './hooks/useSandingBox';
import SandingBox from './SandingBox';
import AudioPlayer from './AudioPlayer';

type OutputPanelProps = {
  message: string;
  logMessage: string;
};

const ADDITIONAL_PROMPT = "Draw it as HTML table.";

const OutputPanel: React.FC<OutputPanelProps> = ({ message, logMessage }) => {
  const { isLoading, mousePosition } = useSandingBox();
  const { handleError } = useError();
  const [accumulatedMessages, setAccumulatedMessages] = useState<string>('');
  const [accumulatedCode, setAccumulatedCode] = useState<string>('');
  const [isTextSelected, setIsTextSelected] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  // Store cursor position for floating AudioPlayer
  const [selectedPosition, setSelectedPosition] = useState<{ x: number; y: number } | null>(null);
  
  const playAudio = (text: string) => {
    const audioUrl = API_URLS.TTS("ECHO") + "?text=" + encodeURIComponent(text);
    const audio = new Audio(audioUrl);
    audio.play().catch(err => console.error("Audio play error:", err));
  };
  
  // On mouse up, capture selection and cursor position.
  const handleTextSelection = (e: React.MouseEvent<HTMLDivElement>) => {
    const selection = window.getSelection()?.toString();
    if (selection && selection.trim().length > 1) {
      setIsTextSelected(true);
      setSelectedText(selection);
      setSelectedPosition({ x: e.clientX, y: e.clientY });
    } else {
      setIsTextSelected(false);
      setSelectedText('');
      setSelectedPosition(null);
    }
  };

  const handleDoubleClick = (fragment: string, index: number) => {
    setAccumulatedCode(prev => prev + '\n' + fragment);
  };

  const handlePromptBttnClick = async (prompt: string) => {
    try {
      const response = await axios.post(API_URLS.CustomerQuery, { data: prompt }, { withCredentials: true });
      setAccumulatedMessages(prev => prev + '\nYou: ' + prompt + '\n' + response.data);
    } catch (error: any) {
      handleError('' + error + ' ' + error.response?.data.message, error);
    }
  };

  const formatText = (text: string): JSX.Element[] => {
    const complexRegex = /(```[\s\S]*?```)|(\n)|(^>>>.*$)|(^#!.*$)|(^\|.*?\|$(?:\n^\|.*?\|$)*)|(<table>[\s\S]*?<\/table>)|(<body>[\s\S]*?<\/body>)|(<prompts>[\s\S]*?<\/prompts>)/gm;
    const elements = text.split(complexRegex).map((fragment, index) => {
      if (!fragment) return null;
      const isAIPrompts = fragment.startsWith('<prompts>');
      const isUserPrompt = fragment.startsWith('You:');
      const isCodeBlock = fragment.startsWith('>>>') || fragment.startsWith('#!');
      const isBacktickCode = fragment.startsWith('```') && fragment.endsWith('```');
      const isNewLine = fragment === '\n';
      const isTable = fragment.trim().startsWith('|') && fragment.trim().endsWith('|');
      const isHTMLTable = /<(table|body)>[\s\S]*<\/\1>/.test(fragment.trim());

      if (isUserPrompt) {
        return <p key={index} className="user-prompt">{fragment}</p>;
      } else if (isAIPrompts) {
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
        return <CopyableCodeBlock key={index}>{codeContent}</CopyableCodeBlock>;
      } else if (isTable) {
        const rows = fragment.trim().split('\n').map(row =>
          row.split('|').slice(1, -1).map(cell => cell.trim())
        );
        return (
          <CopyableCodeBlock key={index}>
            <table key={`table-${index}`}>
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
      } else if (isHTMLTable) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(fragment, 'text/html');
        
        // Extract content from <body> or the entire fragment if <body> is not present
        const sanitizedHtml = doc.body ? doc.body.innerHTML : fragment;
      
        return (
          <CopyableCodeBlock key={index}>{sanitizedHtml}</CopyableCodeBlock>
        );      
      } else if (isNewLine) {
        return null;
      } else {
        // For plain text lines, add a right-click handler to immediately trigger TTS.
        return (
          <p
            key={index}
            onDoubleClick={() => handleDoubleClick(fragment, index)}
            onMouseUp={handleTextSelection}
            onContextMenu={(e) => {
              e.preventDefault();
              playAudio(fragment);
            }}
          >
            {fragment}
          </p>
        );
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
  }, [message, logMessage]);

  return (
    <>
      {isLoading && <SandingBox mousePosition={mousePosition} />}
      <div className="output-panel" onClick={handleTextSelection}>
        {message || logMessage ? formatText(accumulatedMessages) : null}
      </div>
      {/* Floating AudioPlayer: rendered at the cursor when text is selected */}
      {isTextSelected && selectedText.trim().length > 1 && selectedPosition && (
        <div
          className="selected-audio-player"
          style={{
            position: 'fixed',
            left: selectedPosition.x,
            top: selectedPosition.y,
            transform: 'translate(-50%, -100%)',
            zIndex: 1000,
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            // Force a new fetch if needed
          }}
        >
          <AudioPlayer
            endpoint={API_URLS.TTS("ECHO")}
            textToSpeechText={selectedText}
            start={true}
          />
        </div>
      )}
    </>
  );
};

export default OutputPanel;