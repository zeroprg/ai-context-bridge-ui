import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AiOutlineLoading3Quarters } from 'react-icons/ai'; // Import the loading icon

// Update the props interface
interface AudioPlayerProps {
  endpoint: string; // URL to fetch the audio file
  textToSpeechText: string; // Text to convert to speech
  start: boolean; // Control flag for starting the audio fetch
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ endpoint, textToSpeechText, start }) => {
  const [audioSrc, setAudioSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [autoFetch, setAutoFetch] = useState<boolean>(start);

  useEffect(() => {
    // Fetch audio if autoFetch is true
    if (autoFetch) {
      fetchAudio();
    }
  }, [endpoint, textToSpeechText, autoFetch]); // Add textToSpeechText to dependencies array

  const selectedVoice = "NOVA"; // This should be dynamic based on user selection or some logic

  const fetchAudio = () => {
    setIsLoading(true);
    axios.post(endpoint, { data: textToSpeechText }, {
      params: { voice: selectedVoice }, // Add the selectedVoice as a query parameter
      withCredentials: true,
      responseType: 'blob'
    })
      .then(response => {
        const blob = new Blob([response.data], { type: 'audio/mp3' });
        setAudioSrc(URL.createObjectURL(blob));
        // Set autoFetch to false after successful fetch to disable autoplay in future
        setAutoFetch(false);
      })
      .catch(error => {
        console.error('Error fetching audio file:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleIconClick = () => {
    // Fetch audio on icon click
    if (!autoFetch) {
      setAutoFetch(true);
    }
  };

  return (
    <>
      {isLoading && <AiOutlineLoading3Quarters className="message-icon loading" />}
      {!isLoading &&  (
        <label className="small-text" onClick={handleIconClick} title="Text to Speech">
          <i className="fas fa-volume-up"></i>
        </label>
      )}
      {audioSrc && (
        <audio
          controls
          autoPlay={autoFetch}
          src={audioSrc}
          onPlay={() => setAutoFetch(false)} // Disable autoplay after first play
          style={{ width: 100, display: 'block' }} // Make the audio player small and visible
        />
      )}
    </>
  );
};

export default AudioPlayer;