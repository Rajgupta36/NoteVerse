'use client';
import React, { useEffect, useState } from 'react';

const ErrorPopup = ({ errorMessage }: { errorMessage: string }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000); // 2 minutes in milliseconds

    return () => clearTimeout(timer); // Cleanup the timer when the component unmounts
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center">
      <span className="mr-2">{errorMessage}</span>
      <button
        onClick={() => setIsVisible(false)}
        className="text-white hover:text-gray-200 ml-auto"
      >
        ✕
      </button>
    </div>
  );
};

export default ErrorPopup;
