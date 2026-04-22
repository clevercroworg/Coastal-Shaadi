import { useEffect } from 'react';

export default function Heartbeat() {
  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        const stored = localStorage.getItem('userProfile');
        if (!stored) return;
        const userData = JSON.parse(stored);
        if (!userData?.id) return;

        await fetch('/api/heartbeat', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userData.id })
        });
      } catch (e) {}
    };

    // Send immediately on mount
    sendHeartbeat();

    // Then every 30 seconds
    const interval = setInterval(sendHeartbeat, 30000);
    return () => clearInterval(interval);
  }, []);

  return null; // invisible component
}
