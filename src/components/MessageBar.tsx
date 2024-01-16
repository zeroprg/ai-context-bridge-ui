import React, { useState, useRef } from 'react';
import { AiOutlineArrowUp, AiOutlineLoading3Quarters, AiOutlinePaperClip, AiOutlineDelete } from 'react-icons/ai';
import axios from 'axios';
import * as pdfjsLib from 'pdfjs-dist';

import './MessageBar.css'; // Make sure this CSS file exists
import { API_URLS } from '../apiConstants'; // Adjust the import path as needed
import { prepareFileContent } from '../utils/filePreparation';

import { useError } from '../ErrorContext';
import { storeContextDocument} from "../utils/llama";
import FileIcon from '../utils/FileIconProps';
import useSandingBox from './hooks/useSandingBox';
import SandingBox from './SandingBox';
import AudioTranscription from './AudioTranscription';

// Set the workerSrc to the path of the pdf.worker.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs`;

const PROMT_GENERATION_QUERY = 'Based on uploaded text generate prompt questions. Show only list of questions. Ask to draw it as table.';
type MessageBarProps = {
    message: string;
    onSend: (message: string) => void;
    onLogSend: (message: string) => void;
};

const MessageBar: React.FC<MessageBarProps> = ({ message, onSend, onLogSend }) => {
    const { isLoading, setIsLoading, mousePosition } = useSandingBox();
    const { handleError } = useError();
    const [messageText, setMessageText] = useState(message);
    const [filesContent, setFilesContent] = useState<Map<string, string[]>>(new Map());    
   // const [isLoading, setIsLoading] = useState(false); // State to track loading

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            filePreparation(event.target.files[0]);
                    // Reset the value of the input to ensure onChange fires again with the same file
        event.target.value = '';

        }
    };

    const filePreparation = async (selectedFile: File) => {
        try {
            if (selectedFile) {
                onLogSend(`${selectedFile.name} start uploading......`);
                const documents:string[] = await prepareFileContent(selectedFile);
                if (documents.length === 0) {
                    throw new Error(`Unsupported file type for: ${selectedFile.name} we will support it soon` );
                }

                // Store index and update filesContent state
                storeContextDocument(selectedFile.name,  documents);


                // Invoke onLogSend with the log message
                onLogSend(`${selectedFile.name} was uploaded and indexed/stored in your private context.`);
                setFilesContent(new Map(filesContent.set(selectedFile.name, documents)));
                setTimeout(generateFilesPrompts, 500);
            }
           // setSelectedFile(null);
        } catch (error: any) {
            console.error('Error sending message:', error);
            handleError('' + error + ' ' + error.response?.data.message, error);
        }
    };

    const handleRemoveFile = (fileName: string) => {     

        // Remove file from context
        axios.delete(API_URLS.DeleteFileFromContext(fileName), {withCredentials: true}).then(response =>{
            // Remove file from filesContent state
            filesContent.delete(fileName);
            setFilesContent(new Map(filesContent));
             })
        .catch(error => {handleError('' + error + ' ' + error.response?.data.message, error);  })
    }    

    const generateFilesPrompts = async () => {
        setIsLoading(true); // Start loading
        try {
            const payload = `${PROMT_GENERATION_QUERY}`; ///add prompts here
            const response = await axios.post(API_URLS.CustomerQuery, { data: payload }, { withCredentials: true });
            onSend(`<prompts>${response.data}</prompts>`);
        } catch (error: any) {
            handleError('' + error + ' ' + error.response?.data.message, error);
        } finally {
            setIsLoading(false); // End loading
            setMessageText('');
        }
    }    

    const handleSendClick = async () => {
        setIsLoading(true); // Start loading
        setMessageText('');
        adjustTextareaHeight();
        try {
            const payload = `${messageText}`; ///add prompts here
            const response = await axios.post(API_URLS.CustomerQuery, { data: payload }, { withCredentials: true });
            onSend(`You: ${messageText} \n ${response.data}`);
        } catch (error: any) {
            handleError('' + error + ' ' + error.response?.data.message, error);
        } finally {
            setIsLoading(false); // End loading           
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Check if the Enter key was pressed
        if (event.key === 'Enter') {
            handleSendClick();
        }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessageText(event.target.value);
    };
    const textareaRef = useRef<HTMLTextAreaElement>(null);


    const adjustTextareaHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    };

return (
    <div>
     {isLoading && <SandingBox mousePosition={mousePosition} />}    
    <div className="message-bar">
        {/* File icons and names with hover content */}
        <label htmlFor="file-upload">
            <AiOutlinePaperClip className="attachment-icon" />
        </label>       
        <input
            type="file"
            id="file-upload"
            title='Load any file to your private context to process it.'
            style={{ display: 'none' }}
            onChange={handleFileChange}
        />
        <AudioTranscription  onTranscription={(transcript) => console.log(transcript)} />
        <textarea
                ref={textareaRef}
                className="message-input"
                value={messageText}
                onChange={(e) => {
                    handleInputChange(e);
                    adjustTextareaHeight();
                }}
                placeholder="Type your message..."
                style={{ height: 'auto' }} // Initial height set to auto
                onKeyPress={handleKeyPress}
        />
            {isLoading ? (
                <AiOutlineLoading3Quarters className="message-icon loading" />
            ) : (
                <AiOutlineArrowUp className="message-icon" onClick={handleSendClick} />
            )}

        </div>
        <div className="file-icons">
            {Array.from(filesContent.entries()).map(([fileName, fileContent]) => (
                <div key={fileName} className="file-icon">
                    <FileIcon fileName={fileName} />
                    <span>{fileName}</span>
                    <AiOutlineDelete 
                        className="delete-file-icon" 
                        onClick={() => handleRemoveFile(fileName)}
                    />
                    <div className="file-content-tooltip">
                        {fileContent.join('\n')}
                    </div>
                </div>
            ))}
        </div>

        </div>
)};

export default MessageBar;
