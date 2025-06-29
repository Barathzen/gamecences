
export interface User {
  username: string;
  credits: number; // Changed to number for calculations
  status: string;
}

export interface UserProgress {
  ongoingAdventures: OngoingAdventure[];
  availableContracts: StoryCategory[];
  maxOngoingContracts: number;
}

export interface StoryCategory {
  id: string;
  title: string;
  description: string;
  initialPrompt: string;
  systemInstruction: string;
}

export interface AdventureStep {
  sceneDescription: string;
  imagePrompt: string;
  choices: string[];
}

export interface HistoryEntry {
  sceneDescription: string;
  imagePrompt: string;
  playerChoice: string;
}

export interface OngoingAdventure {
  storyId: string; // Corresponds to StoryCategory id
  title: string;
  history: HistoryEntry[];
  currentStep: AdventureStep | null;
  currentImageUrl: string | null;
  level: number;
}


// This structure is based on the Gemini API documentation for Google Search grounding.
// It's included for completeness if grounding were to be used, but not essential for the current text adventure.
export interface GroundingChunkWeb {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web?: GroundingChunkWeb;
  // other types can be added if grounding supports more (e.g., "retrievedContext")
}

export interface GroundingMetadata {
  searchQuery?: string; // If available from API
  groundingChunks?: GroundingChunk[];
}