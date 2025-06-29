import { User, UserProgress } from '../types';
import { STORY_CATEGORIES, INITIAL_CONTRACT_SLOTS } from '../constants';

const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'currentUser';
const USER_PROGRESS_KEY_PREFIX = 'userProgress_';

// --- User Account Management ---

export const getUsers = (): any[] => {
  try {
    const usersJson = localStorage.getItem(USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  } catch (error) {
    console.error("Failed to parse users from localStorage", error);
    return [];
  }
};

export const saveUsers = (users: any[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const seedInitialUsers = (): void => {
    if (!localStorage.getItem(USERS_KEY)) {
        const defaultUsers = [{ username: 'V', password: 'password123' }];
        saveUsers(defaultUsers);
        // Also seed progress for the default user
        const initialProgress: UserProgress = { 
            ongoingAdventures: [],
            availableContracts: [...STORY_CATEGORIES],
            maxOngoingContracts: INITIAL_CONTRACT_SLOTS
        };
        saveUserProgress('V', initialProgress);
    }
};


// --- Current User Session ---

export const getCurrentUser = (): User | null => {
  try {
    const userJson = localStorage.getItem(CURRENT_USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error("Failed to parse current user from localStorage", error);
    return null;
  }
};

export const saveCurrentUser = (user: User): void => {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};

export const clearCurrentUser = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
};


// --- User Progress Management ---

const getDefaultUserProgress = (): UserProgress => ({
  ongoingAdventures: [],
  availableContracts: [...STORY_CATEGORIES],
  maxOngoingContracts: INITIAL_CONTRACT_SLOTS,
});

export const getUserProgress = (username: string): UserProgress => {
  // Guests don't have saved progress
  if (username === 'Nomad') {
    return getDefaultUserProgress();
  }
  
  try {
    const progressJson = localStorage.getItem(`${USER_PROGRESS_KEY_PREFIX}${username}`);
    if (progressJson) {
      const parsed = JSON.parse(progressJson);
      // Provide defaults for users with old data structure for backward compatibility
      return {
        ongoingAdventures: parsed.ongoingAdventures || [],
        availableContracts: parsed.availableContracts || [...STORY_CATEGORIES],
        maxOngoingContracts: parsed.maxOngoingContracts || INITIAL_CONTRACT_SLOTS
      };
    }
    return getDefaultUserProgress(); // Return fresh progress if none found
  } catch (error) {
    console.error(`Failed to parse progress for user ${username}`, error);
    return getDefaultUserProgress();
  }
};

export const saveUserProgress = (username: string, progress: UserProgress): void => {
  if (username === 'Nomad') return; // Do not save progress for guests

  try {
    const progressJson = JSON.stringify(progress);
    localStorage.setItem(`${USER_PROGRESS_KEY_PREFIX}${username}`, progressJson);
  } catch (error) {
    console.error(`Failed to save progress for user ${username}`, error);
  }
};