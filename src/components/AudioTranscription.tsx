import React, { useState, useRef, useCallback, useEffect } from 'react';
import axios from 'axios';
import { AiOutlineAudio } from 'react-icons/ai';
import { useError } from '../ErrorContext';

interface AudioTranscriptionProps {
  onTranscription: (transcript: string) => void;
  serverUrl: string;
}

const AudioTranscription: React.FC<AudioTranscriptionProps> = ({ onTranscription, serverUrl }) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const isRecordingRef = useRef(isRecording);
  const streamRef = useRef<MediaStream | null>(null);
  const { handleError } = useError();

  // Audio analysis refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const checkIntervalRef = useRef<number | null>(null);
  const silenceTimeoutRef = useRef<number | null>(null);
  const lastLoudTimeRef = useRef<number>(0);
  const isProcessingRef = useRef(false); // Add processing lock

  // Configuration
  const SILENCE_THRESHOLD = 10;
  const MIN_AUDIO_DURATION = 0.5;
  const DEBOUNCE_TIME = 500;

  const mimeType = useCallback(() => {
    const types = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/mp4",
      "audio/mpeg"
    ];
    return types.find(MediaRecorder.isTypeSupported) || "";
  }, [])();

  const cleanupResources = useCallback(() => {
    if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    if (audioContextRef.current) audioContextRef.current.close();
    
    checkIntervalRef.current = null;
    silenceTimeoutRef.current = null;
    analyserRef.current = null;
    audioContextRef.current = null;
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const initializeRecorder = useCallback(async () => {
    cleanupResources();
    isProcessingRef.current = false;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      source.connect(analyserRef.current);

      mediaRecorder.current = new MediaRecorder(stream, { mimeType });
      
      mediaRecorder.current.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }

        // Only process when recorder is inactive
        if (mediaRecorder.current?.state === 'inactive' && !isProcessingRef.current) {
          isProcessingRef.current = true;
          const shouldSend = await validateAudioDuration();
          
          if (shouldSend) {
            await sendAudioToServer();
          }
          
          audioChunks.current = [];
          isProcessingRef.current = false;
          
          if (isRecordingRef.current) {
            initializeRecorder();
          }
        }
      };

      mediaRecorder.current.start();
      lastLoudTimeRef.current = Date.now();

      // Start audio monitoring
      checkIntervalRef.current = window.setInterval(analyzeAudio, 100);
    } catch (error) {
      handleError(`Microphone error: ${error}`);
    }
  }, [mimeType, handleError, cleanupResources]);

  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.fftSize);
    analyserRef.current.getByteTimeDomainData(dataArray);

    let max = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const value = Math.abs(dataArray[i] - 128);
      if (value > max) max = value;
    }

    if (max > SILENCE_THRESHOLD) {
      lastLoudTimeRef.current = Date.now();
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
    } else {
      const silenceDuration = Date.now() - lastLoudTimeRef.current;
      if (silenceDuration >= 2000 && !silenceTimeoutRef.current) {
        silenceTimeoutRef.current = window.setTimeout(() => {
          if (mediaRecorder.current?.state === 'recording') {
            mediaRecorder.current.requestData();
            mediaRecorder.current.stop();
          }
          silenceTimeoutRef.current = null;
        }, DEBOUNCE_TIME);
      }
    }
  }, []);

  const validateAudioDuration = async () => {
    if (audioChunks.current.length === 0) return false;
    
    try {
      const blob = new Blob(audioChunks.current, { type: mimeType });
      const arrayBuffer = await blob.arrayBuffer();
      const duration = await new Promise<number>((resolve) => {
        const audioContext = new AudioContext();
        audioContext.decodeAudioData(arrayBuffer, (buffer) => {
          audioContext.close();
          resolve(buffer.duration);
        }, () => {
          audioContext.close();
          resolve(0);
        });
      });
      return duration >= MIN_AUDIO_DURATION;
    } catch {
      return false;
    }
  };

  const sendAudioToServer = useCallback(async () => {
    if (audioChunks.current.length === 0) return;

    try {
      const blob = new Blob(audioChunks.current, { type: mimeType });
      const formData = new FormData();
      formData.append('audioFile', blob, `recording_${Date.now()}.webm`);
      
      const response = await axios.post(serverUrl, formData, { withCredentials: true });
      onTranscription(response.data);
    } catch (error) {
      handleError(error instanceof Error ? error.message : 'Upload failed');
    }
  }, [serverUrl, onTranscription, handleError, mimeType]);

  const startRecording = useCallback(() => {
    setIsRecording(true);
    isRecordingRef.current = true;
    initializeRecorder();
  }, [initializeRecorder]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    isRecordingRef.current = false;

    if (mediaRecorder.current?.state === 'recording') {
      mediaRecorder.current.requestData();
      mediaRecorder.current.stop();
    }

    cleanupResources();
  }, [cleanupResources]);

  useEffect(() => {
    return () => {
      cleanupResources();
      if (mediaRecorder.current?.state === 'recording') {
        mediaRecorder.current.stop();
      }
    };
  }, [cleanupResources]);

  const toggleRecording = useCallback(() => {
    isRecording ? stopRecording() : startRecording();
  }, [isRecording, startRecording, stopRecording]);

  return (
    <div>
      <label onClick={toggleRecording} className={isRecording ? 'recording' : ''}>
        {isRecording ? (
          <AiOutlineAudio style={{ color: 'red', fontSize: '48px' }} />
        ) : (
          <AiOutlineAudio style={{ color: 'green', fontSize: '28px' }} />
        )}
      </label>
      <input type="checkbox" style={{ display: 'none' }} checked={isRecording} readOnly />
    </div>
  );
};

export default AudioTranscription;