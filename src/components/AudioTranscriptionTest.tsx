import React, { useState } from 'react';
import AudioTranscription from './AudioTranscription';

const AudioTranscriptionTest: React.FC = () => {
  const [latestTranscript, setLatestTranscript] = useState('');

  // Called whenever the AudioTranscription sends a transcript
  const handleTranscription = (transcript: string) => {
    setLatestTranscript(transcript);
    console.log('Received transcript:', transcript);
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Audio Transcription Test</h2>

      <AudioTranscription
        // Replace this dummy URL with your real endpoint if needed
        serverUrl="https://dummy.server.url/upload"
        onTranscription={handleTranscription}
      />

      <p style={{ marginTop: '1rem' }}>
        <strong>Latest Transcript:</strong> {latestTranscript}
      </p>
    </div>
  );
};

export default AudioTranscriptionTest;