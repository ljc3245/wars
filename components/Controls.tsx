
import React from 'react';

interface ControlsProps {
  onUndo: () => void;
  onSave: () => void;
  onLoad: () => void;
  onReset: () => void;
  isDarkMode: boolean;
}

const Controls: React.FC<ControlsProps> = ({ onUndo, onSave, onLoad, onReset, isDarkMode }) => {
  const btnClass = "flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm shadow-sm transition-all active:scale-95 text-white border border-white/10";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
      <button 
        onClick={onUndo}
        className={`${btnClass} bg-gradient-to-br from-orange-400 to-orange-500 hover:shadow-orange-400/30 hover:shadow-lg`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
        悔棋
      </button>
      <button 
        onClick={onSave}
        className={`${btnClass} bg-gradient-to-br from-indigo-500 to-indigo-600 hover:shadow-indigo-500/30 hover:shadow-lg`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
        快照
      </button>
      <button 
        onClick={onLoad}
        className={`${btnClass} bg-gradient-to-br from-blue-500 to-blue-600 hover:shadow-blue-500/30 hover:shadow-lg`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        读取
      </button>
      <button 
        onClick={onReset}
        className={`${btnClass} bg-gradient-to-br from-rose-500 to-rose-600 hover:shadow-rose-500/30 hover:shadow-lg`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        重置
      </button>
    </div>
  );
};

export default Controls;
