import React from 'react';

interface ChoiceButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
}

const ChoiceButton: React.FC<ChoiceButtonProps> = ({ text, onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full text-left font-body font-bold text-lg text-sky-200 bg-sky-900/20 border-2 border-sky-500/50 p-4 
                 hover:bg-sky-700/40 hover:text-white hover:border-sky-400
                 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75
                 disabled:bg-gray-700/50 disabled:text-gray-400 disabled:border-gray-600 disabled:cursor-not-allowed
                 transition-all duration-200 ease-in-out group"
    >
      <span className="group-hover:translate-x-2 transition-transform duration-200 ease-in-out inline-block">
        <span className="text-sky-400 mr-3 text-xl font-mono">&gt;</span>{text}
      </span>
    </button>
  );
};

export default ChoiceButton;
