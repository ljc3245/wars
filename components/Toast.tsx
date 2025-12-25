
import React from 'react';

interface ToastProps {
  message: string;
  visible: boolean;
  type: 'success' | 'info';
  isDarkMode: boolean;
}

const Toast: React.FC<ToastProps> = ({ message, visible, type, isDarkMode }) => {
  const bgColor = type === 'success' 
    ? (isDarkMode ? 'bg-emerald-600/90' : 'bg-emerald-500') 
    : (isDarkMode ? 'bg-blue-600/90' : 'bg-blue-500');

  return (
    <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[300] transition-all duration-500 pointer-events-none ${
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
    }`}>
      <div className={`${bgColor} text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-3 border border-white/20 backdrop-blur-md`}>
        {type === 'success' ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        )}
        <span className="font-bold tracking-wider text-sm">{message}</span>
      </div>
    </div>
  );
};

export default Toast;
