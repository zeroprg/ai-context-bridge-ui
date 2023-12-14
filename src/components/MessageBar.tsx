import React, { useState } from 'react';
import { AiOutlineArrowUp, AiOutlinePaperClip } from 'react-icons/ai'; // Importing Paper Clip icon for attachments
import axios from 'axios';
import './MessageBar.css'; // Make sure this CSS file exists
import { API_URLS } from '../apiConstants'; // Adjust the import path as needed
import { prepareFileContentAsString } from './filePreparation';
import { useError } from '../ErrorContext';

type MessageBarProps = {
    message: string;
    onSend: (message: string, file: File | null) => void; // Updated to include file
};

const MessageBar: React.FC<MessageBarProps> = ({ message, onSend }) => {
    const { handleError } = useError();
    const [messageText, setMessageText] = useState(message);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMessageText(event.target.value);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
        }
    };
    
    const handleSendClick = async () => {
        try {
            let payload = `Message: ${messageText}`;
    
            if (selectedFile) {
                payload = await prepareFileContentAsString(selectedFile, messageText);
            }
    
            // Send the payload as a string with the axios POST request
            const response = await axios.post(API_URLS.CustomerQuery, { data: payload }, { withCredentials: true });
            console.log(response.data);
            setMessageText('');
            setSelectedFile(null);
        } catch (error: any) {
           console.error('Error sending message:', error);          
           handleError(''+ error +' '+  error.response.data.message, error); 
        }
    };
    
    

    return (
        <div className="message-bar">
            <label htmlFor="file-upload">
                <AiOutlinePaperClip className="attachment-icon" />
            </label>
            <input
                type="file"
                id="file-upload"
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
            <input
                className="message-input"
                type="text"
                value={messageText}
                onChange={handleInputChange}
                placeholder="Type your message..."
            />
            <AiOutlineArrowUp className="message-icon" onClick={handleSendClick} />
        </div>
    );

};

export default MessageBar;
