import React, { useState, useRef, useCallback, useEffect } from 'react';
import axios from 'axios';
import { AiOutlineAudio } from 'react-icons/ai';
import { useError } from '../ErrorContext'; 
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
interface AudioTranscriptionProps {
  onTranscription: (transcript: string) => void;
  serverUrl: string;
}

const AudioTranscription: React.FC<AudioTranscriptionProps> = ({ onTranscription, serverUrl }) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const sendInterval = useRef<number | null>(null);
  const isRecordingRef = useRef(isRecording);


  const { handleError } = useError();

  const mimeTypeToExtension: { [key: string]: string } = {
    "audio/webm;codecs=opus": ".webm",
    "audio/webm": ".webm",
    "audio/ogg;codecs=opus": ".ogg",
    "audio/mp4": ".mp4",
    "audio/ogg": ".ogg",
    "audio/flac": ".flac",
    "audio/x-m4a": ".m4a",
    "audio/mp3": ".mp3",
    "audio/mpeg": ".mpeg",
    "audio/mpga": ".mpga",
    "audio/wav": ".wav",
};

// Function to select a supported mime type
  const getSupportedMimeType = useCallback(() => {
    const types = Object.keys(mimeTypeToExtension);
    return types.find(type => MediaRecorder.isTypeSupported(type)) || "";
  }, []);

  const mimeType = getSupportedMimeType();
  const fileExtension = mimeTypeToExtension[mimeType] || '.webm';

  const initializeRecorder = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      handleError("getUserMedia is not supported in this browser.");
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const newRecorder = new MediaRecorder(stream, { mimeType });
      newRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };
      // Clear existing chunks to ensure a fresh start for new recording
      audioChunks.current = [];
      newRecorder.start(3000); // Collect data every 3 seconds
      mediaRecorder.current = newRecorder;
    } catch (error) {
      handleError(`Error accessing the microphone: ${error}`);
    }
  }, [handleError, mimeType]);
  

  const sendAudioToServer = useCallback(() => {
    if (audioChunks.current.length === 0) {
      return;
    }
    const audioBlob = new Blob(audioChunks.current, { type: mimeType });
    const formData = new FormData();
    formData.append('audioFile', audioBlob, `audio${fileExtension}`);
    axios.post(serverUrl, formData, { withCredentials: true })
      .then(response => {
        onTranscription(response.data);
        audioChunks.current = []; // Clear the chunks after sending
        const currentIsRecording = isRecordingRef.current;
        if (currentIsRecording) {
          if (mediaRecorder.current) {
            mediaRecorder.current.stop();
            mediaRecorder.current = null;
          } 
          initializeRecorder(); // Re-initialize the recorder for the next chunk
        }
      })
      .catch(error => handleError(error.message));
      
  }, [serverUrl, onTranscription, handleError, fileExtension, mimeType, initializeRecorder]);

  const startRecording = useCallback(() => { 
    setIsRecording(true);
    isRecordingRef.current = true;
    initializeRecorder();
    clearInterval(sendInterval.current ?? 0);
    sendInterval.current = window.setInterval(sendAudioToServer, 60 * 500); // Send audio every 0.5 minute
  }, [initializeRecorder, sendAudioToServer]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    isRecordingRef.current = false;
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      mediaRecorder.current = null;
    }    
    sendAudioToServer(); // Send the last chunk of audio
    clearInterval(sendInterval.current ?? 0);
    sendInterval.current = null;
  }, [sendAudioToServer]);

  useEffect(() => {
    return () => {
      if (sendInterval.current !== null) {
        clearInterval(sendInterval.current);
      }
    };
  }, []);

  const toggleRecording = useCallback(() => {
    if (isRecording) {      
      stopRecording();
    } else {
      startRecording();
    }
  }, [stopRecording, startRecording, isRecording]);

  return (
    <div>
      <label onClick={toggleRecording} className={isRecording ? 'recording' : ''}>
        {isRecording ? <AiOutlineAudio style={{ color: 'green', fontSize: '48px' }} /> : <AiOutlineAudio  className='attachment-icon'/>}
      </label>
      <input type="checkbox" style={{ display: 'none' }} checked={isRecording} readOnly />
    </div>
  );
};

export default AudioTranscription;