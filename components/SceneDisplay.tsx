import React from 'react';
import { PLACEHOLDER_IMAGE_URL, LOADING_IMAGE_URL } from '../constants';
import LoadingSpinner from './LoadingSpinner';

interface SceneDisplayProps {
  imageUrl: string | null;
  sceneDescription: string;
  isLoadingImage: boolean;
}

const SceneDisplay: React.FC<SceneDisplayProps> = ({ imageUrl, sceneDescription, isLoadingImage }) => {
  const currentImageSrc = isLoadingImage ? LOADING_IMAGE_URL : (imageUrl || PLACEHOLDER_IMAGE_URL);

  return (
    <div className="w-full lg:w-1/2 xl:w-3/5 p-4 flex flex-col items-center cyber-panel">
      <div className="w-full mb-4">
          <h2 className="font-display text-2xl font-semibold text-glow border-b-2 border-sky-500/50 pb-2">VISUAL FEED</h2>
      </div>
      <div className="relative aspect-video w-full max-w-2xl bg-black border-2 border-sky-900/50 shadow-xl overflow-hidden">
        <img
          src={currentImageSrc}
          alt="Current adventure scene"
          className={`w-full h-full object-cover transition-all duration-500 ${isLoadingImage ? 'opacity-50 blur-sm' : 'opacity-100'}`}
          onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMAGE_URL)}
        />
        {isLoadingImage && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                <LoadingSpinner message="Generating visual..." size="small" />
            </div>
        )}
      </div>
      <div className="w-full mt-6">
         <h2 className="font-display text-2xl font-semibold text-glow border-b-2 border-sky-500/50 pb-2 mb-4">DATASTREAM</h2>
         <div className="bg-black/20 p-4 h-48 overflow-y-auto border border-sky-900/50">
            <p className="text-sky-200 leading-relaxed text-lg whitespace-pre-wrap font-medium">
                {sceneDescription}
            </p>
         </div>
      </div>
    </div>
  );
};

export default SceneDisplay;