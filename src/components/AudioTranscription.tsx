import React, { useState, useRef, useCallback, useEffect } from 'react';
import axios from 'axios';
import { AiOutlineAudio } from 'react-icons/ai';
import { useError } from '../ErrorContext'; // Ensure this is correctly implemented in your project

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
  //const [setAudioUrl] = useState<string>(''); 
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const { handleError } = useError(); // Assuming useError is correctly implemented to handle errors

 // MIME type to file extension mapping
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
const fileExtension = mimeTypeToExtension[mimeType] || '.webm'; // Default to .webm if not found



  const startRecording = useCallback(async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          setMediaStream(stream);
          const newRecorder = new MediaRecorder(stream, { mimeType });
          mediaRecorder.current = newRecorder;
          newRecorder.start();
          setIsRecording(true);

          newRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunks.current.push(event.data);
            }
          };
        })
        .catch((error) => {
          handleError("Error accessing the microphone: " + error.message);
        });
    } else {
      handleError("getUserMedia is not supported in this browser.");
    }
  }, [handleError, mimeType]);


  const sendAudioToServer = useCallback((audioBlob: Blob) => {
    if (audioBlob.size > 0) {
      const formData = new FormData();
      formData.append('audioFile', audioBlob, `audio${fileExtension}`);
      axios.post(serverUrl, formData, { withCredentials: true })
        .then(response => onTranscription(response.data))
        .catch(error => handleError(error.message));
    } else {
      handleError("The recorded audio is empty. Please try recording again.");
    }
  }, [serverUrl, onTranscription, handleError, fileExtension]);
  
  const stopRecording = useCallback(() => {
    if (!mediaRecorder.current) {
      return; // Early return if mediaRecorder is not initialized
    }
  
    mediaRecorder.current.onstop = () => {
      // This ensures the recording has fully stopped and all data is available
      const audioBlob = new Blob(audioChunks.current, { type: mimeType });
      if (audioBlob.size > 0) {
        //const audioUrl = URL.createObjectURL(audioBlob); // Create the URL for the new blob
        //setAudioUrl(audioUrl); // Update state with the new audio URL
        sendAudioToServer(audioBlob); // Send the current recording
      } else {
        handleError("The recorded audio is empty. Please try recording again.");
      }
      audioChunks.current = []; // Clear the chunks after processing
    };
  
    // Stop the recorder which will trigger the onstop event handler above
    mediaRecorder.current.stop();
  
    setIsRecording(false); // Update recording state
  
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop()); // Stop the media stream tracks
      setMediaStream(null); // Clear the media stream
    }
  }, [sendAudioToServer, mimeType, handleError, mediaStream]);
  

  useEffect(() => {
    return () => {
      // Cleanup: stop the media stream when the component is unmounted
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaStream]);

  const handleRecordingToggle = useCallback(() => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return (
      <div>
        <label onClick={handleRecordingToggle} className={isRecording ? 'recording' : ''}>
          {isRecording ? <AiOutlineAudio style={{ color: 'green', fontSize: '48px' }} /> : <AiOutlineAudio className="attachment-icon"/>}
        </label>
        <input type="checkbox" style={{ display: 'none' }} checked={isRecording} readOnly />
      </div>
  );
};

export default AudioTranscription;