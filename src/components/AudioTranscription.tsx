import React, { useState } from 'react';
import { AiOutlineAudioMuted, AiOutlineAudio } from 'react-icons/ai';
import { useWebSocketClient } from './hooks/useWebSocketClient';
import { useMediaRecorder } from './hooks/useMediaRecorder';
import { useError } from '../ErrorContext';
import { API_URLS } from '../apiConstants';

/**
 * `AudioTranscription` is a React component that provides audio recording functionality.
 * It allows users to click a button to start/stop recording.
 *
 * Props:
 * - `onTranscription`: A callback function that is called with the transcription result.
 *
 * State:
 * - `isRecording`: Boolean state indicating whether recording is active.
 */

const AudioTranscription: React.FC<{ onTranscription: (transcript: string) => void }> = ({ onTranscription }) => {
    const [isRecording, setIsRecording] = useState(false);
   
    const { handleError } = useError();
    const { sendJsonMessage } = useWebSocketClient(API_URLS.WsAudio, onTranscription);

    const { startRecording, stopRecording } = useMediaRecorder(sendJsonMessage, handleError);



/**
 * Toggles recording on and off.
 * When recording starts, a message is sent to initiate streaming.
 * When recording stops, a message is sent to stop streaming.
 */
const handleRecordingToggle = () => {
    if (!isRecording) {       
        startRecording();
    } else {
        stopRecording();     
    }
    setIsRecording(prevState => !prevState);
};

    return (
        <div>
        <label
            onClick={handleRecordingToggle}
            className={isRecording ? 'recording' : ''}
        >
            {isRecording ? <AiOutlineAudioMuted className="attachment-icon" /> : <AiOutlineAudio className="attachment-icon" />}
        </label>
        <input
            type="checkbox"
            style={{ display: 'none' }}
            checked={isRecording}
            readOnly
        />
    </div>
    );
};

export default AudioTranscription;
