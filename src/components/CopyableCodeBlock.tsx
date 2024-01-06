import React, { useState, useRef } from 'react';
import './CopyableCodeBlock.css';

interface CopyableCodeBlockProps {
  children: React.ReactNode;
}

const CopyableCodeBlock: React.FC<CopyableCodeBlockProps> = ({ children }) => {
  const [buttonLabel, setButtonLabel] = useState('Copy to Clipboard');
  const codeRef = useRef<HTMLElement>(null);

  const copyToClipboard = () => {
    if (codeRef.current) {
      const textToCopy = codeRef.current.innerText;
      navigator.clipboard.writeText(textToCopy).then(() => {
        setButtonLabel('Copied');
        setTimeout(() => setButtonLabel('Copy to Clipboard'), 3000); // Reset label after 3 seconds
      }).catch(err => {
        console.error("Failed to copy text: ", err);
      });
    }
  };

  return (
    <div className="code-container">
      <code ref={codeRef} className="code-style">
        {children}
      </code>
      <button 
        className="copy-icon" 
        onClick={copyToClipboard}
        title={buttonLabel}
      >
        {buttonLabel}
      </button>
    </div>
  );
};

export default CopyableCodeBlock;
