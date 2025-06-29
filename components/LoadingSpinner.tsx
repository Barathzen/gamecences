import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = "Loading...", size = 'large' }) => {
  const sizeClasses = size === 'large' ? 'h-16 w-16 border-4' : 'h-8 w-8 border-2';

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center"
        aria-live="polite" aria-busy="true">
      <div className="relative">
        <div 
          className={`${sizeClasses} border-sky-500/30 rounded-full`}
          style={{ animation: 'cyber-loader-glitch 1s linear infinite alternate-reverse' }}
        ></div>
        <div 
          className={`${sizeClasses} border-t-sky-400 border-r-sky-400 border-b-transparent border-l-transparent rounded-full absolute top-0 left-0`}
          style={{ animation: 'cyber-loader-rotate 0.8s linear infinite' }}
        ></div>
      </div>
      {message && (
        <p className={`mt-4 font-display font-semibold text-glow tracking-wider ${size === 'large' ? 'text-xl' : 'text-base'}`}>{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;