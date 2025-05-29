import React, { useEffect, useState, useRef } from 'react';
import './App.css'; 

function App() {
  const [connectionStatus, setConnectionStatus] = useState(navigator.onLine ? 'online' : 'offline');
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const pingTimerRef = useRef(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, []);

  useEffect(() => {
    const updateStatus = () => {
      const isOnline = navigator.onLine;
      setConnectionStatus(isOnline ? 'online' : 'offline');
      if (isOnline) {
        connectWebSocket();
      }
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    updateStatus();

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  // WebSocket logic
  const connectWebSocket = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) return;

    socketRef.current = new WebSocket('ws://localhost:8080');

    socketRef.current.onopen = () => {
      console.log('[WS] connected');
      clearInterval(reconnectTimerRef.current);
      pingTimerRef.current = setInterval(() => {
        if (socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send('ping');
        }
      }, 10000);
    };

    socketRef.current.onmessage = (event) => {
      if (event.data !== 'pong') {
        console.log('[WS] Message:', event.data);
      }
    };

    socketRef.current.onerror = (err) => {
      console.error('[WS] Error:', err);
      socketRef.current.close();
    };

    socketRef.current.onclose = () => {
      console.log('[WS] Disconnected');
      clearInterval(pingTimerRef.current);
      attemptReconnect();
    };
  };

  const attemptReconnect = () => {
    if (!reconnectTimerRef.current) {
      reconnectTimerRef.current = setInterval(() => {
        if (navigator.onLine) {
          console.log('[WS] Attempting to reconnect...');
          connectWebSocket();
        }
      }, 3000);
    }
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      socketRef.current?.close();
      clearInterval(pingTimerRef.current);
      clearInterval(reconnectTimerRef.current);
    };
  }, []);

  return (
    <div>
      <div className={`status-banner ${connectionStatus}`}>
        {connectionStatus === 'online' ? 'You are online ✅' : 'You are offline ❌'}
      </div>
      <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <h1>WebSocket + Offline Demo</h1>
        <p>Disconnect your internet to test offline mode.</p>
        <p>Open console to see WebSocket activity.</p>
      </div>
    </div>
  );
}

export default App;
