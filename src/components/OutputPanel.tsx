import React from 'react';
import './OutputPanel.css'; // make sure to create an accompanying CSS file

type OutputPanelProps = {
  text: string;
};

const OutputPanel: React.FC<OutputPanelProps> = ({ text }) => {
  // This function checks for code blocks and applies the appropriate styling.
  const formatText = (text: string) => {
    const codeRegex = /`([^`]+)`/g; // Matches text between backticks
    return text.split(codeRegex).map((fragment, index) => 
      index % 2 === 1 ? <code key={index}>{fragment}</code> : fragment // Applies code styling to text in backticks
    );
  };

  return (
    <div className="output-panel">
      {formatText(text)}
    </div>
  );
};

export default OutputPanel;