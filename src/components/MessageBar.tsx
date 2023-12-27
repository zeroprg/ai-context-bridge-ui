import React, { useState, useRef } from 'react';
import { AiOutlineArrowUp, AiOutlineLoading3Quarters, AiOutlinePaperClip, AiOutlineDelete } from 'react-icons/ai';
import axios from 'axios';
import * as pdfjsLib from 'pdfjs-dist';

import './MessageBar.css'; // Make sure this CSS file exists
import { API_URLS } from '../apiConstants'; // Adjust the import path as needed
import { prepareFileContentAsString } from '../utils/filePreparation';
import { useError } from '../ErrorContext';
import { storeContext, getContext, queryIndex } from "../utils/llama";
import FileIcon from '../utils/FileIconProps';

// Set the workerSrc to the path of the pdf.worker.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.269/pdf.worker.min.mjs`;

type MessageBarProps = {
    message: string;
    onSend: (message: string) => void;
    onLogSend: (message: string) => void;
};

const MAXIMUM_CHARACTER_TOSHOW = 10;


const MessageBar: React.FC<MessageBarProps> = ({ message, onSend, onLogSend }) => {
    const { handleError } = useError();
    const [messageText, setMessageText] = useState(message);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filesContent, setFilesContent] = useState<Map<string, string[]>>(new Map());    
    const [isLoading, setIsLoading] = useState(false); // State to track loading




    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            filePreparation(event.target.files[0]);
        }
    };

    const filePreparation = async (selectedFile: File) => {
        try {
            if (selectedFile) {
                onLogSend(`${selectedFile.name} start uploading......`);
                const documents = await prepareFileContentAsString(selectedFile);
                if (documents.length === 0) {
                    throw new Error(`Unsupported file type for: ${selectedFile.name}`);
                }

                // Store index and update filesContent state
                storeContext(selectedFile.name,  documents);
                // Invoke onLogSend with the log message
                onLogSend(`${selectedFile.name} was uploaded and indexed/stored in your private context.`);
                setFilesContent(new Map(filesContent.set(selectedFile.name, documents)));
            }
            setSelectedFile(null);
        } catch (error: any) {
            console.error('Error sending message:', error);
            handleError('' + error + ' ' + error.response?.data.message, error);
        }
    };

    const handleRemoveFile = (fileName: string) => {
        // Remove file from filesContent state
        filesContent.delete(fileName);
        setFilesContent(new Map(filesContent));
    }    


    const handleSendClick = async () => {
        setIsLoading(true); // Start loading
        try {
            let payload = `${messageText}`; ///add prompts here
            const response = await axios.post(API_URLS.CustomerQuery, { data: payload }, { withCredentials: true });
            onSend(response.data);
        } catch (error: any) {
            handleError('' + error + ' ' + error.response?.data.message, error);
        }
        setIsLoading(false); // End loading
        setMessageText('');
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
    <div className="message-bar">
        {/* File icons and names with hover content */}
        <label htmlFor="file-upload">
            <AiOutlinePaperClip className="attachment-icon" />
        </label>

        <input
            type="file"
            id="file-upload"
            style={{ display: 'none' }}
            onChange={handleFileChange}
        />

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
