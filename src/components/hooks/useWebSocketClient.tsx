import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useEffect } from 'react';

export const useWebSocketClient = (
  WS_URL: string,
  onTranscription: (message: string) => void
): { sendJsonMessage: (message: any) => void, readyState: ReadyState } => {
  const { lastMessage, readyState, sendJsonMessage } = useWebSocket(WS_URL, {
    shouldReconnect: () => true,
  });

  useEffect(() => {
    if (lastMessage !== null) {
      onTranscription(lastMessage.data);
    }
  }, [lastMessage, onTranscription]);

  return { sendJsonMessage, readyState };
};
