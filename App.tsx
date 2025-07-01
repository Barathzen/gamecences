import React, { useState, useCallback, useEffect } from 'react';
import { AdventureStep, HistoryEntry, User, StoryCategory, OngoingAdventure, UserProgress } from './types';
import { generateAdventureStep, generateAdventureImage, generateNewStoryCategory } from './services/geminiService';
import * as storage from './services/storageService';
import SceneDisplay from './components/SceneDisplay';
import ChoiceButton from './components/ChoiceButton';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import Hud from './components/Hud';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import ImageSettings, { ImageGenerationSettings } from './components/ImageSettings';
import { generateImageWithFallback } from './services/imageService';
import {
  APP_TITLE,
  PLACEHOLDER_IMAGE_URL,
  STORY_CATEGORIES,
  ADVENTURE_LEVEL_GOAL,
  ADVENTURE_COMPLETION_REWARD,
  getNextSlotCost
} from './constants';

type View = 'auth' | 'dashboard' | 'game';

const App: React.FC = () => {
  // App State
  const [view, setView] = useState<View>('auth');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [activeAdventure, setActiveAdventure] = useState<OngoingAdventure | null>(null);

  // Loading/Error State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingImage, setIsLoadingImage] = useState<boolean>(false);
  const [isGeneratingContract, setIsGeneratingContract] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Image Settings State
  const [imageSettings, setImageSettings] = useState<ImageGenerationSettings>({
    modelKey: 'FLUX_SCHNELL',
    priority: 'balanced',
    enhancementLevel: 'enhanced',
    autoSelect: true
  });
  const [showImageSettings, setShowImageSettings] = useState<boolean>(false);

  useEffect(() => {
    storage.seedInitialUsers();
    const user = storage.getCurrentUser();
    if (user) {
      handleAuthSuccess(user);
    }
  }, []);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    const progress = storage.getUserProgress(user.username);
    setUserProgress(progress);
    setView('dashboard');
  };

  const handleLogout = () => {
    storage.clearCurrentUser();
    setCurrentUser(null);
    setUserProgress(null);
    setActiveAdventure(null);
    setView('auth');
  };

  const saveAndExitToDashboard = () => {
    if (activeAdventure && currentUser && currentUser.username !== 'Nomad' && userProgress) {
      const progress = { ...userProgress };
      const existingIndex = progress.ongoingAdventures.findIndex(adv => adv.title === activeAdventure.title);
      if (existingIndex > -1) {
        progress.ongoingAdventures[existingIndex] = activeAdventure;
      } else {
        progress.ongoingAdventures.push(activeAdventure);
      }
      storage.saveUserProgress(currentUser.username, progress);
      setUserProgress(progress);
    }
    setActiveAdventure(null);
    setView('dashboard');
  };

  const handleAcceptContract = (category: StoryCategory) => {
    if (!currentUser || !userProgress) return;
    if (userProgress.ongoingAdventures.length >= userProgress.maxOngoingContracts) {
        alert("All contract slots are full. Complete an ongoing contract or purchase a new slot.");
        return;
    }

    // 1. Remove contract from available list and update state immediately
    const updatedAvailableContracts = userProgress.availableContracts.filter(c => c.id !== category.id);
    const progressWithContractRemoved = { ...userProgress, availableContracts: updatedAvailableContracts };
    setUserProgress(progressWithContractRemoved);
    if (currentUser.username !== 'Nomad') {
        storage.saveUserProgress(currentUser.username, progressWithContractRemoved);
    }
    
    // 2. Start the adventure
    const newAdventure: OngoingAdventure = {
      storyId: category.id,
      title: category.title,
      history: [],
      currentStep: null,
      currentImageUrl: PLACEHOLDER_IMAGE_URL,
      level: 0,
    };
    setActiveAdventure(newAdventure);
    setView('game');
    handleNewAdventureStep(category.initialPrompt, newAdventure);

    // 3. Generate a new contract in the background (for non-guests)
    if (currentUser.username !== 'Nomad') {
        setIsGeneratingContract(true);
        const allCurrentTitles = [
            ...userProgress.ongoingAdventures.map(adv => adv.title),
            ...updatedAvailableContracts.map(c => c.title)
        ];

        generateNewStoryCategory(allCurrentTitles)
          .then(newContract => {
            setUserProgress(prev => {
                if (!prev) return null;
                const finalProgress = {
                    ...prev,
                    availableContracts: [...prev.availableContracts, newContract]
                };
                storage.saveUserProgress(currentUser.username, finalProgress);
                return finalProgress;
            });
          })
          .catch(err => {
            console.error("Failed to generate and add new contract:", err);
            // Optional: You could add the contract back to the list here if generation fails.
          })
          .finally(() => {
            setIsGeneratingContract(false);
          });
    }
  };

  const handleContinueAdventure = (adventure: OngoingAdventure) => {
    setActiveAdventure(adventure);
    setView('game');
    // If the adventure was interrupted mid-load, restart the last step generation
    if (!adventure.currentStep && adventure.history.length > 0) {
        const lastEntry = adventure.history[adventure.history.length - 1];
        const prompt = `The last scene was: "${lastEntry.sceneDescription}"
My choice was: "${lastEntry.playerChoice}"
Based on my choice, generate the next part of the story.`;
        handleNewAdventureStep(prompt, adventure);
    }
  };

  const handlePurchaseSlot = () => {
    if (!currentUser || currentUser.username === 'Nomad' || !userProgress) return;
    const cost = getNextSlotCost(userProgress.maxOngoingContracts);
    if (currentUser.credits < cost) {
        alert("Not enough credits to purchase a new contract slot.");
        return;
    }

    const updatedUser = { ...currentUser, credits: currentUser.credits - cost };
    const updatedProgress = { ...userProgress, maxOngoingContracts: userProgress.maxOngoingContracts + 1 };

    setCurrentUser(updatedUser);
    setUserProgress(updatedProgress);
    storage.saveCurrentUser(updatedUser);
    storage.saveUserProgress(currentUser.username, updatedProgress);
  };
  
  const handleNewAdventureStep = useCallback(async (promptContent: string, adventure: OngoingAdventure) => {
    setIsLoading(true);
    setError(null);
    setIsLoadingImage(true);
    
    // Find category from both default list and dynamically added ones
    const category = userProgress?.availableContracts.find(c => c.id === adventure.storyId) || STORY_CATEGORIES.find(c => c.id === adventure.storyId);
    if (!category) {
        setError("Could not find story category configuration.");
        setIsLoading(false);
        setIsLoadingImage(false);
        return;
    }

    try {
      const adventureData = await generateAdventureStep(promptContent, category.systemInstruction);
      const updatedAdventure = { ...adventure, currentStep: adventureData };

      setActiveAdventure(updatedAdventure);
      setIsLoading(false); // Text is loaded, UI can update

      generateImageWithFallback(
        adventureData.imagePrompt,
        category.id,
        {
          priority: imageSettings.priority,
          enhancementLevel: imageSettings.enhancementLevel
        }
      )
        .then(imageUrl => {
            console.log("Received imageUrl:", imageUrl);
            setActiveAdventure(adv => adv ? {...adv, currentImageUrl: imageUrl} : null);
        })
        .catch(imgError => {
            console.error("Image generation failed:", imgError);
            setActiveAdventure(adv => adv ? {...adv, currentImageUrl: PLACEHOLDER_IMAGE_URL} : null);
        })
        .finally(() => {
            setIsLoadingImage(false);
        });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setActiveAdventure(adv => adv ? {...adv, currentStep: null, currentImageUrl: PLACEHOLDER_IMAGE_URL} : null);
      setIsLoading(false);
      setIsLoadingImage(false);
    }
  }, [userProgress]);

  const handleChoice = useCallback((choiceText: string) => {
    if (!activeAdventure || !activeAdventure.currentStep || isLoading || isLoadingImage) return;

    let adventureToUpdate = { ...activeAdventure, level: activeAdventure.level + 1 };
    
    const newHistoryEntry: HistoryEntry = {
      sceneDescription: activeAdventure.currentStep.sceneDescription,
      imagePrompt: activeAdventure.currentStep.imagePrompt,
      playerChoice: choiceText,
    };
    adventureToUpdate.history.push(newHistoryEntry);
    
    // Story Completion Logic
    if (adventureToUpdate.level >= ADVENTURE_LEVEL_GOAL) {
      if (currentUser && currentUser.username !== 'Nomad' && userProgress) {
        const updatedUser = { ...currentUser, credits: currentUser.credits + ADVENTURE_COMPLETION_REWARD };
        const progress = { ...userProgress };
        progress.ongoingAdventures = progress.ongoingAdventures.filter(adv => adv.title !== adventureToUpdate.title);
        
        storage.saveUserProgress(currentUser.username, progress);
        storage.saveCurrentUser(updatedUser);
        
        setCurrentUser(updatedUser);
        setUserProgress(progress);
        
        alert(`Congratulations! You have completed "${adventureToUpdate.title}" and earned ${ADVENTURE_COMPLETION_REWARD} credits!`);
      } else {
        alert(`Congratulations! You have completed "${adventureToUpdate.title}"!`);
      }
      setActiveAdventure(null);
      setView('dashboard');
      return;
    }
    
    setActiveAdventure(adventureToUpdate);

    const promptForNextStep = `The last scene was: "${activeAdventure.currentStep.sceneDescription}"
My choice was: "${choiceText}"
Based on my choice, generate the next part of the story.`;
    
    handleNewAdventureStep(promptForNextStep, adventureToUpdate);
  }, [activeAdventure, currentUser, userProgress, handleNewAdventureStep, isLoading, isLoadingImage]);
  
  const renderGame = () => {
    // Initial loading state when starting an adventure.
    if (isLoading && !activeAdventure?.currentStep) {
      return <LoadingSpinner message="Establishing connection..." />;
    }
    
    if (error) {
        return (
          <div className="my-8 w-full max-w-3xl cyber-panel p-4">
            <ErrorMessage message={error} onRetry={() => window.location.reload()} />
          </div>
        );
    }
    
    // Active game view. We show the scene even while loading the next one.
    // The individual components handle their loading states (disabled buttons, loading image).
    if (activeAdventure?.currentStep) {
      const { currentStep, currentImageUrl } = activeAdventure;
      return (
        <div className="flex flex-col lg:flex-row w-full gap-6 items-start">
          <SceneDisplay
            imageUrl={currentImageUrl}
            sceneDescription={currentStep.sceneDescription}
            isLoadingImage={isLoadingImage}
          />
          <div className="w-full lg:w-1/2 xl:w-2/5 p-4 space-y-3 flex flex-col cyber-panel">
            <h2 className="font-display text-2xl font-semibold text-glow border-b-2 border-sky-500/50 pb-2 mb-2">ACTIONS (LVL {activeAdventure.level}/{ADVENTURE_LEVEL_GOAL})</h2>
            {currentStep.choices.map((choice, index) => (
              <ChoiceButton
                key={index}
                text={choice}
                onClick={() => handleChoice(choice)}
                disabled={isLoading || isLoadingImage}
              />
            ))}
             <button
              onClick={saveAndExitToDashboard}
              disabled={isLoading || isLoadingImage}
              className="w-full mt-6 bg-yellow-800/50 border border-yellow-500/50 hover:bg-yellow-700/70 text-yellow-200 font-semibold py-2 px-4 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
              // SAVE & EXIT TO DASHBOARD
              </button>
          </div>
        </div>
      );
    }
    
    return <LoadingSpinner message="Initializing interface..."/>;
  }

  const renderContent = () => {
    switch(view) {
        case 'auth':
            return <Auth onAuthSuccess={handleAuthSuccess} />;
        case 'dashboard':
            if (currentUser && userProgress) {
                return <Dashboard 
                            user={currentUser} 
                            progress={userProgress} 
                            onAcceptContract={handleAcceptContract} 
                            onContinue={handleContinueAdventure}
                            onPurchaseSlot={handlePurchaseSlot}
                            isGeneratingContract={isGeneratingContract}
                        />;
            }
            return <LoadingSpinner message="Loading user data..."/>; // Or back to auth
        case 'game':
            return renderGame();
        default:
            return <Auth onAuthSuccess={handleAuthSuccess} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-2 sm:p-4 font-body selection:bg-sky-400 selection:text-black">
      <header className="w-full max-w-7xl mx-auto cyber-panel mb-4 flex-shrink-0">
        <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-glow">{APP_TITLE}</h1>
            {currentUser && <Hud user={currentUser} onLogout={handleLogout} />}
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto flex-grow flex flex-col items-center justify-center">
        {renderContent()}
      </main>

      <footer className="w-full max-w-7xl mx-auto text-center py-4 mt-4 flex-shrink-0">
        <p className="text-xs text-sky-500/50 uppercase tracking-widest">
          SYSTEM ONLINE // V1.0.0
        </p>
      </footer>
      
      {/* Image Settings Panel - only show during gameplay */}
      {view === 'game' && activeAdventure && (
        <ImageSettings
          storyCategory={activeAdventure.storyId}
          onSettingsChange={setImageSettings}
          isOpen={showImageSettings}
          onToggle={() => setShowImageSettings(!showImageSettings)}
        />
      )}
    </div>
  );
};

export default App;