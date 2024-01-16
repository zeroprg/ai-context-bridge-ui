import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';

import { jsPDF } from 'jspdf';
import { getDocument, PDFDocumentProxy} from 'pdfjs-dist';
import html2canvas from 'html2canvas'; 

import './CopyableCodeBlock.css';
import FileIcon from '../utils/FileIconProps';

import { PdfToTextConverter } from "../utils/PdfToTextConverter";

interface CopyableCodeBlockProps {
    children: any;
}

const CopyableCodeBlock: React.FC<CopyableCodeBlockProps> = ({ children }) => {
    const [buttonLabel, setButtonLabel] = useState('Copy to Clipboard');

    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(children as any);
    const contentRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isCanvasPopulated, setIsCanvasPopulated] = useState(false);

    const handleMouseEnterPdfIcon = () => {
        setIsCanvasPopulated(true); // Show canvas when mouse enters the PDF icon        
    };

    const handleMouseLeaveCanvas = () => {
        if (isCanvasPopulated) {
            setIsCanvasPopulated(false); // Hide canvas when mouse leaves
        }
    };

 
const convertToPDF = async (content: any): Promise<PDFDocumentProxy> => {
    const doc = new jsPDF();
    try {
        if (React.isValidElement(content) ||  isHtmlContent(content) ) {
            const canvas = await renderContentToCanvas(content);
            const imageData = canvas.toDataURL('image/png');
            const aspectRatio = canvas.width / canvas.height;
            const maxWidth = 195;
            const maxHeight = maxWidth / aspectRatio;

            doc.addImage(imageData, 'PNG', 10, 10, maxWidth, maxHeight);
        } else {
            // Handle plain text content
            doc.text(String(content), 10, 10);
        }

        const pdfBlob = doc.output('blob');
        const arrayBuffer = await pdfBlob.arrayBuffer();
        return getDocument({ data: arrayBuffer }).promise;
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
};

const isHtmlContent = (content:string) => /<(table|div)>[\s\S]*<\/\1>/.test(content.trim());

const renderContentToCanvas = async (content: any) => {
    const container = document.createElement('div');
    setupContainer(container);
    if (React.isValidElement(content)) ReactDOM.render(<>{content}</>, container);
    else if (isHtmlContent(content)) container.innerHTML = content;
    
    document.body.appendChild(container);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Adjust delay as needed

    const canvas = await html2canvas(container, { logging: true, useCORS: true });
    cleanUp(container);
    return canvas;
};

const setupContainer = (container:any) => {
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '100%';
};

const cleanUp = (container:any) => {
    if (container) {
        ReactDOM.unmountComponentAtNode(container);
        document.body.removeChild(container);
    }
};
    // Handler for converting and rendering PDF
    const handleConvertToPDF = async () => {
        setIsCanvasPopulated(false);
        try {
            const pdf = await convertToPDF(content);
             
            await renderPDFToCanvas(pdf);
        } catch (error) {
            console.error("Error in converting/rendering PDF: ", error);
        }
    };

    // Function to render the PDF onto the canvas    
    const renderPDFToCanvas = async (pdf: PDFDocumentProxy): Promise<void> => {
        const imageSources = await PdfToTextConverter.convertBatchOfPdfToImages(pdf, 1, 1); // Assuming only first page
        PdfToTextConverter.renderImageOnCanvas(imageSources, canvasRef)
            .then(image => {
                // Use the loaded and rendered Image object here

            })
            .catch(error => {
            });
            // Set canvas populated state to true after rendering
            setIsCanvasPopulated(true);
    };

    const toggleEdit = () => {
        setIsEditing(edit => !edit);
    };

    useEffect(() => {
        if (isEditing && contentRef.current) {
            contentRef.current.focus();
        }
    }, [isEditing]);

    const copyToClipboard = () => {
        if (contentRef.current) {
            const textToCopy = contentRef.current.innerText;
            navigator.clipboard.writeText(textToCopy).then(() => {
                setButtonLabel('Copied');
                setTimeout(() => setButtonLabel('Copy to Clipboard'), 3000); // Reset label after 3 seconds
            }).catch(err => {
                console.error("Failed to copy text: ", err);
            });
        }
    };


    const convertToDocx = () => {
        console.log('Convert to DOCX:', content);
        // Implement DOCX conversion logic
    };

    const convertToXlsx = () => {
        console.log('Convert to XLSX:', content);
        // Implement XLSX conversion logic
    };


    const renderContent = () => {
        if (typeof children === 'string') {
            // If children is a string, use dangerouslySetInnerHTML
            return <div 
                     ref={contentRef} 
                     className="code-style"
                     contentEditable={isEditing}
                     onDoubleClick={toggleEdit}
                     onBlur={() => setIsEditing(false)}
                     onInput={e => setContent(e.currentTarget.textContent || '')}
                     dangerouslySetInnerHTML={{ __html: children }}
                   />;
        } else {
            // If children is not a string, render it directly
            return <div 
                     ref={contentRef} 
                     className="code-style"
                     contentEditable={isEditing}
                     onDoubleClick={toggleEdit}
                     onBlur={() => setIsEditing(false)}
                     onInput={e => setContent(e.currentTarget.textContent || '')}
                   >
                     {children}
                   </div>;
        }
    };


    return (
        <div className="code-container">
            {renderContent()}
            <canvas 
                ref={canvasRef} 
                className={`pdf-canvas ${isCanvasPopulated ? '' : 'hide-canvas'}`}
                onMouseLeave={handleMouseLeaveCanvas}>

            </canvas>
            <div className='copy-icon-container'>

                <span className="convert-icon" onClick={copyToClipboard} title={buttonLabel}><FileIcon fileName="*.copy" /></span>
                <span className="convert-icon" onClick={handleConvertToPDF} title="Convert to PDF"><FileIcon fileName="*.pdf" /></span>
                <span className="convert-icon" onClick={convertToDocx} title="Convert to DOCX"><FileIcon fileName="*.docx" /></span>
                <span className="convert-icon" onClick={convertToXlsx} title="Convert to XLSX"><FileIcon fileName="*.xlsx" /></span>
            </div>
        </div>
    );
};

export default CopyableCodeBlock;
