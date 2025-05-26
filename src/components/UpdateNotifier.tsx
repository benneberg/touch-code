import React, { useEffect, useState } from "react";
import { registerSW } from "virtual:pwa-register";

const UpdateNotifier: React.FC = () => {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [updateServiceWorker, setUpdateServiceWorker] = useState<() => void>();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateSW = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true);
        setVisible(true);
      },
      onOfflineReady() {
        setOfflineReady(true);
        setVisible(true);

        // Hide offline ready notification after 3 seconds
        setTimeout(() => {
          setVisible(false);
          setOfflineReady(false);
        }, 3000);
      },
    });

    setUpdateServiceWorker(() => updateSW);
  }, []);

  const handleRefresh = () => {
    if (updateServiceWorker) {
      updateServiceWorker();
    }
  };

  if (!visible) return null;

  return (
    <div
      className="
        fixed bottom-6 left-1/2 transform -translate-x-1/2
        bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg
        flex flex-col items-center space-y-2
        transition-opacity duration-500 opacity-100
      "
      style={{ zIndex: 1000 }}
    >
      {needRefresh ? (
        <>
          <span className="font-semibold">New version available!</span>
          <button
            onClick={handleRefresh}
            className="
              mt-1 px-4 py-1 bg-blue-600 rounded hover:bg-blue-700
              transition duration-300
            "
          >
            Refresh
          </button>
        </>
      ) : (
        <span>App is ready to work offline.</span>
      )}
    </div>
  );
};

export default UpdateNotifier;
