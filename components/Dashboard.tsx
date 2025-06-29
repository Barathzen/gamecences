import React from 'react';
import { User, UserProgress, OngoingAdventure, StoryCategory } from '../types';
import { ADVENTURE_LEVEL_GOAL, getNextSlotCost } from '../constants';
import ChoiceButton from './ChoiceButton';
import LoadingSpinner from './LoadingSpinner';

interface DashboardProps {
  user: User;
  progress: UserProgress;
  onAcceptContract: (category: StoryCategory) => void;
  onContinue: (adventure: OngoingAdventure) => void;
  onPurchaseSlot: () => void;
  isGeneratingContract: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ user, progress, onAcceptContract, onContinue, onPurchaseSlot, isGeneratingContract }) => {
  const slotsUsed = progress.ongoingAdventures.length;
  const maxSlots = progress.maxOngoingContracts;
  const slotsFull = slotsUsed >= maxSlots;
  const nextSlotCost = getNextSlotCost(maxSlots);
  const canAffordSlot = user.credits >= nextSlotCost;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 flex flex-col lg:flex-row gap-6">
      
      {/* Left Panel: Ongoing & Upgrades */}
      <div className="w-full lg:w-2/5 flex flex-col gap-6">
        {/* Ongoing Contracts */}
        <div className="w-full cyber-panel p-6">
          <h2 className="font-display text-3xl text-glow border-b-2 border-sky-500/50 pb-3 mb-4 flex justify-between items-baseline">
            <span>Ongoing Contracts</span>
            <span className="text-xl font-body font-semibold text-sky-300">{slotsUsed} / {maxSlots} SLOTS</span>
          </h2>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {progress.ongoingAdventures.length > 0 ? (
              progress.ongoingAdventures.map((adv) => (
                <div key={adv.storyId} className="bg-black/20 p-4 border border-sky-900/50">
                  <h3 className="font-display text-xl text-sky-200">{adv.title}</h3>
                  <p className="text-sky-400 mb-3">Progress: Level {adv.level} / {ADVENTURE_LEVEL_GOAL}</p>
                  <ChoiceButton text="> Resume Contract" onClick={() => onContinue(adv)} />
                </div>
              ))
            ) : (
              <p className="text-sky-300/80 italic">No active contracts. Check the listings to start a new adventure.</p>
            )}
          </div>
        </div>

        {/* System Upgrades */}
        {user.username !== 'Nomad' && (
           <div className="w-full cyber-panel p-6">
            <h2 className="font-display text-2xl text-glow border-b-2 border-sky-500/50 pb-2 mb-4">System Upgrades</h2>
            <div className="space-y-4">
                <p className="text-sky-300">Purchase additional contract slots to take on more missions simultaneously.</p>
                <div>
                    <p className="font-semibold text-lg">Next Slot Cost: <span className="text-yellow-400 font-mono">¥{nextSlotCost.toLocaleString()}</span></p>
                    <button 
                        onClick={onPurchaseSlot} 
                        disabled={!canAffordSlot}
                        className="w-full mt-3 font-display font-bold text-lg text-black bg-sky-400 p-3 border-2 border-sky-400 hover:bg-sky-300 hover:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200 disabled:bg-gray-600 disabled:border-gray-500 disabled:text-gray-300 disabled:cursor-not-allowed transition-all duration-200"
                    >
                        {canAffordSlot ? '>> PURCHASE SLOT <<' : 'INSUFFICIENT CREDITS'}
                    </button>
                </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Right Panel: Contract Listings */}
      <div className="w-full lg:w-3/5 cyber-panel p-6">
        <h2 className="font-display text-3xl text-glow border-b-2 border-sky-500/50 pb-3 mb-4">
          Contract Listings
        </h2>
        <div className="space-y-4 max-h-[32rem] overflow-y-auto pr-2">
          {progress.availableContracts.map(category => (
            <div key={category.id} className="bg-black/20 p-4 border border-sky-900/50">
              <h3 className="font-display text-xl text-sky-200">{category.title}</h3>
              <p className="text-sky-300/90 my-2 text-base leading-snug">{category.description}</p>
              <ChoiceButton 
                text={slotsFull ? "> SLOTS FULL <" : "> Accept Contract"} 
                onClick={() => onAcceptContract(category)}
                disabled={slotsFull}
              />
            </div>
          ))}
          {isGeneratingContract && (
            <div className="bg-black/20 p-4 border border-sky-900/50">
               <LoadingSpinner message="Pinging relay nodes for new contracts..." size="small" />
            </div>
          )}
          {progress.availableContracts.length === 0 && !isGeneratingContract && (
             <p className="text-sky-300/80 italic">No available contracts on the board. One should appear shortly if a slot is open.</p>
          )}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;