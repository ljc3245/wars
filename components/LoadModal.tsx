
import React from 'react';
import { SaveSlot } from '../types';

interface LoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  slots: SaveSlot[];
  onLoad: (slot: SaveSlot) => void;
  onDelete: (id: string) => void;
  isDarkMode: boolean;
}

const LoadModal: React.FC<LoadModalProps> = ({ isOpen, onClose, slots, onLoad, onDelete, isDarkMode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`rounded-[2rem] w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl overflow-hidden border transition-all duration-500 ${
        isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-white/20'
      }`}>
        <div className={`p-6 border-b flex justify-between items-center transition-colors ${
          isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-gray-50/50 border-gray-100'
        }`}>
          <h2 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-gray-800'}`}>载入快照</h2>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${
            isDarkMode ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-gray-200 text-gray-400'
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {slots.length === 0 ? (
            <div className="text-center py-10">
              <div className={`inline-flex p-4 rounded-full mb-3 transition-colors ${isDarkMode ? 'bg-slate-800' : 'bg-gray-50'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${isDarkMode ? 'text-slate-600' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <p className={`font-medium ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>暂无手动存档快照</p>
            </div>
          ) : (
            slots.map((slot) => (
              <div 
                key={slot.id} 
                className={`group relative flex items-center gap-4 p-3 border rounded-2xl transition-all cursor-pointer shadow-sm hover:shadow-md ${
                  isDarkMode 
                  ? 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600' 
                  : 'bg-white border-gray-100 hover:bg-gray-50'
                }`}
                onClick={() => onLoad(slot)}
              >
                <div className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border transition-colors ${
                  isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-100 border-gray-100'
                }`}>
                  <img src={slot.thumbnail} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-black truncate ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>{slot.timestamp}</p>
                  <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                    RED: {slot.data.scores.RED} • BLUE: {slot.data.scores.BLUE}
                  </p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if(confirm("确定删除此存档？")) onDelete(slot.id);
                  }}
                  className={`p-2 transition-all rounded-lg ${
                    isDarkMode ? 'text-rose-400 hover:bg-rose-500/10' : 'text-rose-300 hover:text-rose-500 hover:bg-rose-50'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
        
        <div className={`p-4 text-center transition-colors ${isDarkMode ? 'bg-slate-950/30' : 'bg-gray-50/50'}`}>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">快照仅保存在本地浏览器</p>
        </div>
      </div>
    </div>
  );
};

export default LoadModal;
