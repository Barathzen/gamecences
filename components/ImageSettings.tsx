import React, { useState, useEffect } from 'react';
import { IMAGE_MODELS, ModelKey, selectOptimalModel } from '../services/imageService';

interface ImageSettingsProps {
  storyCategory: string;
  onSettingsChange: (settings: ImageGenerationSettings) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export interface ImageGenerationSettings {
  modelKey: ModelKey;
  priority: 'speed' | 'quality' | 'balanced';
  enhancementLevel: 'basic' | 'enhanced' | 'premium';
  autoSelect: boolean;
}

const ImageSettings: React.FC<ImageSettingsProps> = ({ 
  storyCategory, 
  onSettingsChange, 
  isOpen, 
  onToggle 
}) => {
  const [settings, setSettings] = useState<ImageGenerationSettings>({
    modelKey: 'FLUX_SCHNELL',
    priority: 'balanced',
    enhancementLevel: 'enhanced',
    autoSelect: true
  });

  // Update model selection when category or settings change
  useEffect(() => {
    if (settings.autoSelect) {
      const optimalModel = selectOptimalModel(storyCategory, settings.priority);
      setSettings(prev => ({ ...prev, modelKey: optimalModel }));
    }
  }, [storyCategory, settings.priority, settings.autoSelect]);

  // Notify parent when settings change
  useEffect(() => {
    onSettingsChange(settings);
  }, [settings, onSettingsChange]);

  const handleModelChange = (modelKey: ModelKey) => {
    setSettings(prev => ({ ...prev, modelKey, autoSelect: false }));
  };

  const handlePriorityChange = (priority: 'speed' | 'quality' | 'balanced') => {
    setSettings(prev => ({ ...prev, priority }));
  };

  const handleEnhancementChange = (enhancementLevel: 'basic' | 'enhanced' | 'premium') => {
    setSettings(prev => ({ ...prev, enhancementLevel }));
  };

  const toggleAutoSelect = () => {
    setSettings(prev => ({ ...prev, autoSelect: !prev.autoSelect }));
  };

  const resetToDefaults = () => {
    setSettings({
      modelKey: 'FLUX_SCHNELL',
      priority: 'balanced',
      enhancementLevel: 'enhanced',
      autoSelect: true
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed top-20 right-4 z-50 bg-sky-900/80 border border-sky-500/50 text-sky-200 p-2 rounded hover:bg-sky-800/80 transition-all duration-200"
        title="Image Generation Settings"
      >
        ⚙️
      </button>
    );
  }

  return (
    <div className="fixed top-20 right-4 z-50 w-80 bg-gray-900/95 border border-sky-500/50 rounded-lg p-4 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display text-lg font-semibold text-sky-200">Image Settings</h3>
        <button
          onClick={onToggle}
          className="text-sky-400 hover:text-sky-200 text-xl"
        >
          ×
        </button>
      </div>

      {/* Auto Selection Toggle */}
      <div className="mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.autoSelect}
            onChange={toggleAutoSelect}
            className="form-checkbox text-sky-500"
          />
          <span className="text-sky-200 text-sm">Auto-select optimal model</span>
        </label>
      </div>

      {/* Priority Selection */}
      <div className="mb-4">
        <label className="block text-sky-200 text-sm font-medium mb-2">Priority</label>
        <div className="grid grid-cols-3 gap-2">
          {(['speed', 'balanced', 'quality'] as const).map((priority) => (
            <button
              key={priority}
              onClick={() => handlePriorityChange(priority)}
              className={`px-3 py-2 text-xs font-medium rounded transition-all duration-200 ${
                settings.priority === priority
                  ? 'bg-sky-600 text-white border border-sky-400'
                  : 'bg-gray-700 text-sky-200 border border-gray-600 hover:bg-gray-600'
              }`}
            >
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Model Selection */}
      <div className="mb-4">
        <label className="block text-sky-200 text-sm font-medium mb-2">
          Model {settings.autoSelect && <span className="text-xs text-sky-400">(Auto)</span>}
        </label>
        <select
          value={settings.modelKey}
          onChange={(e) => handleModelChange(e.target.value as ModelKey)}
          disabled={settings.autoSelect}
          className="w-full bg-gray-800 border border-gray-600 text-sky-200 rounded px-3 py-2 text-sm disabled:opacity-50"
        >
          {Object.entries(IMAGE_MODELS).map(([key, model]) => (
            <option key={key} value={key}>
              {model.name.split('/')[1]} ({model.speed})
            </option>
          ))}
        </select>
        <div className="mt-2 text-xs text-sky-400">
          {IMAGE_MODELS[settings.modelKey].description}
        </div>
      </div>

      {/* Enhancement Level */}
      <div className="mb-4">
        <label className="block text-sky-200 text-sm font-medium mb-2">Enhancement Level</label>
        <div className="grid grid-cols-3 gap-2">
          {(['basic', 'enhanced', 'premium'] as const).map((level) => (
            <button
              key={level}
              onClick={() => handleEnhancementChange(level)}
              className={`px-3 py-2 text-xs font-medium rounded transition-all duration-200 ${
                settings.enhancementLevel === level
                  ? 'bg-sky-600 text-white border border-sky-400'
                  : 'bg-gray-700 text-sky-200 border border-gray-600 hover:bg-gray-600'
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Model Info */}
      <div className="mb-4 p-3 bg-gray-800/50 rounded border border-gray-600">
        <div className="text-xs text-sky-300 space-y-1">
          <div><strong>Current:</strong> {IMAGE_MODELS[settings.modelKey].name}</div>
          <div><strong>Quality:</strong> {IMAGE_MODELS[settings.modelKey].qualityLevel}</div>
          <div><strong>Speed:</strong> {IMAGE_MODELS[settings.modelKey].speed}</div>
          <div><strong>Best for:</strong> {IMAGE_MODELS[settings.modelKey].bestFor.join(', ')}</div>
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={resetToDefaults}
        className="w-full bg-gray-700 border border-gray-600 text-sky-200 py-2 px-4 rounded text-sm hover:bg-gray-600 transition-all duration-200"
      >
        Reset to Defaults
      </button>
    </div>
  );
};

export default ImageSettings;
