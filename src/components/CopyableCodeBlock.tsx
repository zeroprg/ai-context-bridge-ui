import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import Prism from 'prismjs';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import 'prismjs/themes/prism.css';
import './CopyableCodeBlock.css';

const LANGUAGE_STYLES = {
  python: { background: '#f8f8f8', color: '#3572A5', icon: '🐍' },
  javascript: { background: '#f0f8ff', color: '#f1e05a', icon: '📜' },
  html: { background: '#fff3e6', color: '#e34c26', icon: '🖹' },
  css: { background: '#e6f3ff', color: '#2965f1', icon: '🎨' },
  java: { background: '#f3f3f3', color: '#5382a1', icon: '☕' },
  c: { background: '#555555', color: '#ffffff', icon: '🅒' },
  cpp: { background: '#f34b7d', color: '#ffffff', icon: '🅒🅟🅟' },
  csharp: { background: '#239120', color: '#ffffff', icon: '🅒#' },
  go: { background: '#00ADD8', color: '#ffffff', icon: 'g' },
  code: { background: '#ffffff', color: '#333333', icon: '📄' },
  default: { background: '#ffffff', color: '#333333', icon: '📄' },
};

type LanguageKey = keyof typeof LANGUAGE_STYLES;

interface CopyableCodeBlockProps {
  children: React.ReactNode;
  language?: LanguageKey;
}

function getLanguageFromFirstWord(content: string): LanguageKey {
  const [firstWord] = content.trim().split(/\s+/);
  const lowerWord = firstWord?.toLowerCase() || '';
  return lowerWord in LANGUAGE_STYLES ? (lowerWord as LanguageKey) : 'default';
}

function removeFirstLineIfLang(content: string, detectedLang: LanguageKey) {
  if (detectedLang === 'default') return content;
  const lines = content.split('\n');
  const firstWord = lines[0].trim().split(/\s+/)[0]?.toLowerCase() || '';
  if (firstWord === detectedLang) {
    return lines.slice(1).join('\n').trimStart();
  }
  return content;
}

const CopyableCodeBlock: React.FC<CopyableCodeBlockProps> = React.memo(({ children, language }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);
  const [isCodeView, setIsCodeView] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const canvasContainerRef = useRef(document.createElement('div'));

  const detectedLang = useMemo<LanguageKey>(() => {
    if (language) return language;
    if (typeof children === 'string') {
      return getLanguageFromFirstWord(children);
    }
    return 'default';
  }, [children, language]);

  const displayedCode = useMemo(() => {
    if (typeof children !== 'string') return children;
    return removeFirstLineIfLang(children, detectedLang);
  }, [children, detectedLang]);

  useEffect(() => {
    if (preRef.current) {
      Prism.highlightElement(preRef.current);
    }
  }, [displayedCode, detectedLang, isCodeView]);

  const copyToClipboard = useCallback(async () => {
    if (!contentRef.current) return;
    const text = typeof displayedCode === 'string' ? displayedCode : contentRef.current.textContent || '';
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      timeoutRef.current = setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  }, [displayedCode]);

  const generatePDF = useCallback(async () => {
    if (!contentRef.current) return;
    const container = canvasContainerRef.current;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(contentRef.current);
      const pdf = new jsPDF();
      const imgData = canvas.toDataURL('image/png');
      const ratio = canvas.width / canvas.height;

      pdf.addImage(imgData, 'PNG', 10, 10, 190, 190 / ratio);
      setPdfPreview(URL.createObjectURL(pdf.output('blob')));
    } catch (error) {
      console.error('PDF generation failed:', error);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (pdfPreview) URL.revokeObjectURL(pdfPreview);
    };
  }, [pdfPreview]);

  const isDefault = detectedLang === 'default';
  const langStyle = detectedLang === 'html' && !isCodeView
    ? LANGUAGE_STYLES.html
    : LANGUAGE_STYLES[detectedLang];

  const renderContent = useCallback(() => {
    if (detectedLang === 'html') {
      return isCodeView ? (
        <pre ref={preRef} className="language-html">
          {displayedCode}
        </pre>
      ) : (
        <div dangerouslySetInnerHTML={{ __html: displayedCode as string }} />
      );
    }
    return (
      <pre ref={preRef} className={`language-${detectedLang}`}>
        {displayedCode}
      </pre>
    );
  }, [detectedLang, displayedCode, isCodeView]);

  const toggleButtonStyle = {
    backgroundColor: '#eee',
    color: '#333',
    padding: '0.3rem 0.6rem',
    borderRadius: '999px',
    fontWeight: 'bold',
    fontSize: '0.85rem',
    cursor: 'pointer',
  };

  return (
    <div className="code-container" style={{ background: langStyle.background }}>
      <div
        className="badge-bar"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          padding: '0.4rem 0.6rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: langStyle.background,
        }}
      >
        {!isDefault && (
          <span
            className="badge"
            style={{
              backgroundColor: langStyle.color,
              color: '#fff',
              padding: '0.3rem 0.6rem',
              borderRadius: '999px',
              fontWeight: 'bold',
              fontSize: '0.85rem',
            }}
          >
            {langStyle.icon} {detectedLang.toUpperCase()}
          </span>
        )}

        <div className="badge-actions" style={{ display: 'flex', gap: '0.4rem' }}>
          {detectedLang === 'html' && (
            <span
              className="badge clickable"
              onClick={() => setIsCodeView(!isCodeView)}
              style={toggleButtonStyle}
            >
              {isCodeView ? 'Show HTML' : 'Show Code'}
            </span>
          )}
          <span
            className={`badge clickable ${isCopied ? 'copied' : ''}`}
            onClick={copyToClipboard}
            style={toggleButtonStyle}
          >
            {isCopied ? '✓ Copied' : 'Copy'}
          </span>
          <span
            className="badge clickable"
            onClick={generatePDF}
            style={toggleButtonStyle}
          >
            PDF
          </span>
        </div>
      </div>

      <div
        ref={contentRef}
        className="code-content"
        style={{
          color: langStyle.color,
          borderLeft: isDefault ? '4px solid #ccc' : `4px solid ${langStyle.color}`,
        }}
      >
        {renderContent()}
      </div>

      {pdfPreview && (
        <iframe
          title="PDF preview"
          src={pdfPreview}
          className="pdf-preview"
        />
      )}

      {createPortal(
        <div ref={canvasContainerRef} className="pdf-canvas-container" />,
        document.body
      )}
    </div>
  );
});

export default CopyableCodeBlock;