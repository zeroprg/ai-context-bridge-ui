import { useRef, useCallback } from 'react';

export const useMediaRecorder = (
    sendJsonMessage: (message: any) => void,
    handleError: (error: string) => void
) => {
    const mediaRecorder = useRef<MediaRecorder | null>(null);

    const startRecording = useCallback(() => {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then((stream) => {
                const recorder = new MediaRecorder(stream);
                mediaRecorder.current = recorder;

                recorder.ondataavailable = (event: BlobEvent) => {
                    if (event.data && event.data.size > 0) {
                        const reader = new FileReader();
                        reader.onload = () => {
                            const audioData = reader.result?.toString().split(',')[1];
                            if (audioData) {
                                // Split the audioData into chunks of 2000 characters
                                const CHUNK_SIZE = 2000;
                                for (let i = 0; i < audioData.length; i += CHUNK_SIZE) {
                                    const chunk = audioData.substring(i, i + CHUNK_SIZE);
                                    sendJsonMessage({ audio: chunk });
                                }
                            }
                        };
                        reader.onerror = () => handleError('Error reading audio data.');
                        reader.readAsDataURL(event.data);
                    }
                };
                
                recorder.onstop = () => {
                    sendJsonMessage({ STOP_STREAMING: true });
                };

                recorder.start(1000); // Start recording, and generate data every 1000ms (1 second)
            })
            .catch((err) => {
                handleError("Unable to access the microphone. Please ensure it is connected and that you've granted permission.");
            });
    }, [sendJsonMessage, handleError]);

    const stopRecording = useCallback(() => {
        mediaRecorder.current?.stop();
    }, []);

    return { startRecording, stopRecording };

};
