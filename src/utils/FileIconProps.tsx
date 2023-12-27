import React from 'react';
import { FaFilePdf, FaFileImage, FaFileAlt, FaFile, FaFileAudio, FaFileExcel, FaFileWord } from 'react-icons/fa';
import { SiMicrosoftexcel, SiMicrosoftword } from 'react-icons/si'; // For specific Excel and Word icons, if available

type FileIconProps = {
    fileName: string;
};

const FileIcon: React.FC<FileIconProps> = ({ fileName }) => {
    const extension = fileName.split('.').pop()?.toLowerCase();

    switch (extension) {
        case 'pdf':
            return <FaFilePdf className="file-type-icon" />;
        case 'jpg':
        case 'jpeg': // Added JPEG
        case 'png':
        case 'gif':
            return <FaFileImage className="file-type-icon" />;
        case 'txt':
        case 'csv': // Added CSV
            return <FaFileAlt className="file-type-icon" />;
        case 'xlsx':
        case 'xls': // Added Excel
            return <SiMicrosoftexcel className="file-type-icon" />; // Or FaFileExcel
        case 'docx':
        case 'doc': // Added Word
            return <SiMicrosoftword className="file-type-icon" />; // Or FaFileWord
        case 'mp3': // Added MP3
        case 'wav': // Added WAV
            return <FaFileAudio className="file-type-icon" />;
        // Add more cases as needed
        default:
            return <FaFile className="file-type-icon" />;
    }
};

export default FileIcon;