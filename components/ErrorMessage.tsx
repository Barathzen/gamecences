import React from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="bg-red-900/50 border-2 border-red-500 text-red-200 px-6 py-4" role="alert">
      <strong className="font-display block text-lg text-red-400 text-glow">// CONNECTION ERROR</strong>
      <span className="block sm:inline mt-2 font-body text-base">{message}</span>
      {onRetry && (
        <div className="mt-4">
          <button
            onClick={onRetry}
            className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-6 transition-colors duration-150 border border-red-500 hover:border-red-400"
          >
            Attempt Reconnection
          </button>
        </div>
      )}
    </div>
  );
};

export default ErrorMessage;
