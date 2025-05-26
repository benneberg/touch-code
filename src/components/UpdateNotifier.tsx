import React, { useEffect, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';

const UpdateNotifier: React.FC = () => {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [updateServiceWorker, setUpdateServiceWorker] = useState<() => void>();

  useEffect(() => {
    const updateSW = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true);
      },
      onOfflineReady() {
        setOfflineReady(true);
      },
    });
    setUpdateServiceWorker(() => updateSW);
  }, []);

  const handleRefresh = () => {
    if (updateServiceWorker) {
      updateServiceWorker(); // This triggers the new SW to take over and reloads page
    }
  };

  if (!needRefresh && !offlineReady) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#333',
      color: '#fff',
      padding: '1em 2em',
      borderRadius: 8,
      boxShadow: '0 0 10px rgba(0,0,0,0.5)',
      zIndex: 1000,
      maxWidth: '90vw',
      textAlign: 'center',
    }}>
      {needRefresh ? (
        <>
          <div>New version available!</div>
          <button
            onClick={handleRefresh}
            style={{
              marginTop: 8,
              padding: '0.5em 1em',
              backgroundColor: '#06f',
              border: 'none',
              borderRadius: 4,
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Refresh
          </button>
        </>
      ) : (
        <div>App is ready to work offline.</div>
      )}
    </div>
  );
};

export default UpdateNotifier;
