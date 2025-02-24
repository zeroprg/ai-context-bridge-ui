import React, { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface CodeBlockProps {
  code: string;
  language?: string;
}

const  CodeBlockTester: React.FC<CodeBlockProps> = ({ code, language = 'auto' }) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);
  const codeRef = useRef<HTMLPreElement>(null);
  const testResultsRef = useRef<HTMLDivElement>(null);

  // Detect language based on code content
  const detectLanguage = (code: string): string => {
    if (/function\s+.*\(.*\)\s*\{/.test(code)) return 'javascript';
    if (/def\s+\w+\(.*\):/.test(code)) return 'python';
    if (/public\s+class\s+\w+/.test(code)) return 'java';
    if (/<\w+>/.test(code)) return 'html';
    return 'text';
  };

  const lang = language === 'auto' ? detectLanguage(code) : language;

  // Copy to clipboard test
  const testClipboard = async () => {
    try {
      if (!codeRef.current) return;
      const text = codeRef.current.innerText;
      await navigator.clipboard.writeText(text);
      setCopyStatus('success');
      logTestResult('Clipboard Test: ✅ Success (check your clipboard)');
    } catch (err) {
      setCopyStatus('error');
      logTestResult('Clipboard Test: ❌ Failed - ' + (err as Error).message);
    }
  };

  // PDF conversion test
  const testPdfConversion = async () => {
    try {
      if (!codeRef.current) return;
      
      const canvas = await html2canvas(codeRef.current);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const pdfUrl = URL.createObjectURL(pdf.output('blob'));
      setPdfPreview(pdfUrl);
      
      logTestResult('PDF Conversion Test: ✅ Success');
    } catch (err) {
      logTestResult('PDF Conversion Test: ❌ Failed - ' + (err as Error).message);
    }
  };

  // Visual test logger
  const logTestResult = (message: string) => {
    if (!testResultsRef.current) return;
    const result = document.createElement('div');
    result.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    testResultsRef.current.prepend(result);
  };

  return (
    <div style={{ 
      fontFamily: 'monospace',
      maxWidth: '800px',
      margin: '2rem auto',
      padding: '1rem',
      border: '1px solid #ccc',
      borderRadius: '4px'
    }}>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button
          onClick={testClipboard}
          style={{
            padding: '0.5rem 1rem',
            background: copyStatus === 'success' ? '#4CAF50' : 
                       copyStatus === 'error' ? '#F44336' : '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {copyStatus === 'success' ? 'Copied!' : 
           copyStatus === 'error' ? 'Error' : 'Test Clipboard'}
        </button>

        <button
          onClick={testPdfConversion}
          style={{
            padding: '0.5rem 1rem',
            background: pdfPreview ? '#4CAF50' : '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {pdfPreview ? 'PDF Generated' : 'Test PDF Conversion'}
        </button>
      </div>

      <pre
        ref={codeRef}
        style={{
          padding: '1rem',
          background: '#f5f5f5',
          borderRadius: '4px',
          position: 'relative',
          borderLeft: `4px solid ${getLanguageColor(lang)}`
        }}
      >
        <code>{code}</code>
      </pre>

      {pdfPreview && (
        <iframe
          title="PDF Preview"
          src={pdfPreview}
          style={{
            width: '100%',
            height: '500px',
            marginTop: '1rem',
            border: '1px solid #ccc'
          }}
        />
      )}

      <div
        ref={testResultsRef}
        style={{
          marginTop: '1rem',
          padding: '1rem',
          background: '#333',
          color: '#fff',
          borderRadius: '4px',
          maxHeight: '200px',
          overflowY: 'auto'
        }}
      />
    </div>
  );
};

// Helper function for language colors
const getLanguageColor = (lang: string): string => {
  const colors: { [key: string]: string } = {
    javascript: '#f1e05a',
    python: '#3572A5',
    java: '#b07219',
    html: '#e34c26',
    text: '#333'
  };
  return colors[lang] || colors.text;
};

// Example usage in your App component
const App: React.FC = () => {
  return (
    <div>
      <CodeBlockTester
        code={`function greeting() {
  console.log("Hello World");
}`}
        language="javascript"
      />

      <CodeBlockTester
        code={`def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b`}
        language="python"
      />
    </div>
  );
};

export default CodeBlockTester;