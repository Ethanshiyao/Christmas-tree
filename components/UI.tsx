import React from 'react';
import { TreeState } from '../types';

interface UIProps {
  currentMode: TreeState;
  onToggle: () => void;
}

export const UI: React.FC<UIProps> = ({ currentMode, onToggle }) => {
  const isTree = currentMode === TreeState.TREE_SHAPE;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 z-10">
      {/* Header */}
      <header className="flex flex-col items-center pt-8 animate-fade-in">
        <h1 className="font-serif text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 drop-shadow-lg tracking-wider">
          ARIX
        </h1>
        <h2 className="font-sans text-emerald-400 text-xs md:text-sm tracking-[0.3em] uppercase mt-2">
          Signature Collection
        </h2>
      </header>

      {/* Footer / Controls */}
      <footer className="flex flex-col items-center pb-8 gap-4 pointer-events-auto">
        <div className="text-white/60 text-xs font-sans tracking-widest mb-2">
          {isTree ? "MASTERPIECE ASSEMBLED" : "AWAITING INSPIRATION"}
        </div>
        
        <button
          onClick={onToggle}
          className={`
            group relative px-8 py-3 overflow-hidden rounded-full 
            transition-all duration-700 ease-out
            border border-yellow-600/30 backdrop-blur-md
            ${isTree ? 'bg-emerald-950/80' : 'bg-transparent'}
          `}
        >
          {/* Button Glow Effect */}
          <div className={`absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-yellow-500/10 to-transparent transition-transform duration-1000 ${isTree ? 'translate-x-full' : '-translate-x-full group-hover:translate-x-full'}`} />
          
          <span className={`
            relative z-10 font-serif text-lg tracking-widest transition-colors duration-300
            ${isTree ? 'text-yellow-400' : 'text-emerald-200'}
          `}>
            {isTree ? 'DISASSEMBLE' : 'ILLUMINATE'}
          </span>
          
          {/* Border Glow */}
          <div className="absolute inset-0 rounded-full border border-yellow-500/20 group-hover:border-yellow-400/50 transition-colors duration-500" />
        </button>
      </footer>
    </div>
  );
};