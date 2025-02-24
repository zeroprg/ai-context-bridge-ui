import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import './AudioPlayer.css';

interface AudioPlayerProps {
  endpoint: string;          // URL to fetch the audio file
  textToSpeechText: string;  // Text to convert to speech
  start: boolean;            // Control flag to trigger fetching immediately
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ endpoint, textToSpeechText, start }) => {
  const [audioSrc, setAudioSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [autoFetch, setAutoFetch] = useState<boolean>(start);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (autoFetch) {
      fetchAudio();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, textToSpeechText, autoFetch]);

  const selectedVoice = "NOVA"; // Replace with dynamic logic if needed

  const fetchAudio = () => {
    setIsLoading(true);
    axios.post(endpoint, { data: textToSpeechText }, {
      params: { voice: selectedVoice },
      withCredentials: true,
      responseType: 'blob'
    })
      .then(response => {
        const blob = new Blob([response.data], { type: 'audio/mp3' });
        const url = URL.createObjectURL(blob);
        setAudioSrc(url);
        // Force play audio once the src is set
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.play().catch(err => console.error("Audio play error:", err));
          }
        }, 100);
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
    // Trigger a new fetch on right-click if needed
    if (!autoFetch) {
      setAutoFetch(true);
    }
  };

  return (
    <>
      {isLoading && <AiOutlineLoading3Quarters className="audio-loading-icon" />}
      {!isLoading && (
        <label className="audio-icon-label" onClick={handleIconClick} title="Play TTS">
          <i className="fas fa-volume-up"></i>
        </label>
      )}
      {audioSrc && (
        <audio
          ref={audioRef}
          controls
          autoPlay
          src={audioSrc}
          onPlay={() => setAutoFetch(false)}
          className="small-audio-player"
        />
      )}
    </>
  );
};

export default AudioPlayer;