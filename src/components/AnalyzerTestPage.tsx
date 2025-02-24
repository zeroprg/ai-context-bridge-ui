// AnalyzerTestPage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { getGenderByPitch } from './GenderClassifier';

import { SimpleVoiceAnalyzer, AnalyzerData } from './SimpleVoiceAnalyzer';

const BUFFER_SIZE = 30; // Number of pitch values to accumulate

interface VoiceFeatures {
  pitch: number;
  // If you track amplitude, intensity, or buffer, add them here
  amplitude?: number;
  buffer?: Float32Array; 
}

const AnalyzerTestPage: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [pitch, setPitch] = useState(0);
  const [gender, setGender] = useState('Unknown');
  const [fingerprint, setFingerprint] = useState('N/A');

  const analyzerRef = useRef<SimpleVoiceAnalyzer | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const accumulatedPitchesRef = useRef<number[]>([]);

  const startCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const analyzer = new SimpleVoiceAnalyzer();
      analyzerRef.current = analyzer;

      accumulatedPitchesRef.current = []; // Clear previous pitch data

      await analyzer.start(stream, (features) => {
        if (features.pitch > 0 && !Number.isNaN(features.pitch)) {
          // Store pitch into accumulated buffer
          accumulatedPitchesRef.current.push(features.pitch);
      
          // Keep only the last BUFFER_SIZE values
          if (accumulatedPitchesRef.current.length > BUFFER_SIZE) {
            accumulatedPitchesRef.current.shift(); // Remove the oldest pitch
          }
      
          // Compute stable pitch using Median filtering
          const sortedPitches = [...accumulatedPitchesRef.current].sort((a, b) => a - b);
          const stablePitch = sortedPitches[Math.floor(sortedPitches.length / 2)]; // Median pitch
      
          // Update UI with stabilized pitch
          setPitch(stablePitch);
      
          // Get speaker name based on stable pitch
          const speakerName = getGenderByPitch(stablePitch);
          setGender(speakerName);
      
          // Debug logs
          console.log(`Accumulated Pitches: ${accumulatedPitchesRef.current}`);
          console.log(`Stable Pitch: ${stablePitch} Hz`);
          console.log(`Assigned Name: ${speakerName}`);
        }
      });

      setIsRecording(true);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const stopCapture = () => {
    setIsRecording(false);
    analyzerRef.current?.stop();
    analyzerRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopCapture(); // Cleanup when component unmounts
    };
  }, []);

  return (
    <div>
      <h2>Analyzer Test Page</h2>
      <p>Recording? {isRecording ? 'Yes' : 'No'}</p>
      <p>Pitch: {pitch.toFixed(2)} Hz</p>
      <p>Gender: {gender}</p>
      <p>Speaker fingerprint: {fingerprint}</p>

      <button onClick={isRecording ? stopCapture : startCapture}>
        {isRecording ? 'Stop' : 'Start'}
      </button>
    </div>
  );
};

export default AnalyzerTestPage;