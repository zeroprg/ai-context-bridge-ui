import React from 'react';
import { FaFilePdf, FaFileImage, FaFileAlt, FaFile, FaFileAudio, FaFileExcel, FaFileWord, FaCopy } from 'react-icons/fa';
import { SiMicrosoftexcel, SiMicrosoftword } from 'react-icons/si';

type FileIconProps = {
    fileName: string;
};

const FileIcon: React.FC<FileIconProps> = ({ fileName }) => {
    const extension = fileName.split('.').pop()?.toLowerCase();

    switch (extension) {
        case 'pdf':
            return <FaFilePdf className="file-type-icon" />;
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
            return <FaFileImage className="file-type-icon" />;
        case 'txt':
        case 'csv':
            return <FaFileAlt className="file-type-icon" />;
        case 'xlsx':
        case 'xls':
            return <SiMicrosoftexcel className="file-type-icon" />; // Or FaFileExcel
        case 'docx':
        case 'doc':
            return <SiMicrosoftword className="file-type-icon" />; // Or FaFileWord
        case 'mp3':
        case 'wav':
            return <FaFileAudio className="file-type-icon" />;
        case 'copy': // Added .copy file type
            return <FaCopy className="file-type-icon" />;
        // Add more cases as needed
        default:
            return <FaFile className="file-type-icon" />;
    }
};

export default FileIcon;
