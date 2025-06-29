import React, { useState } from 'react';
import { User, UserProgress } from '../types';
import * as storage from '../services/storageService';
import ChoiceButton from './ChoiceButton';
import { STORY_CATEGORIES, INITIAL_CONTRACT_SLOTS } from '../constants';

interface AuthProps {
  onAuthSuccess: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setLoading(false);
        return;
      }
      const users = storage.getUsers();
      if (users.some((user: { username: string }) => user.username.toLowerCase() === username.toLowerCase())) {
        setError('Username already exists. Please choose another.');
        setLoading(false);
        return;
      }
      
      const newUserCredentials = { username, password };
      users.push(newUserCredentials);
      storage.saveUsers(users);

      const userProfile: User = { username, credits: 500, status: 'Rookie' };
      const userProgress: UserProgress = { 
        ongoingAdventures: [],
        availableContracts: [...STORY_CATEGORIES],
        maxOngoingContracts: INITIAL_CONTRACT_SLOTS
      };
      storage.saveUserProgress(username, userProgress);
      storage.saveCurrentUser(userProfile);
      
      onAuthSuccess(userProfile);

    } else { // signin
      const users = storage.getUsers();
      const foundUser = users.find((user: any) => user.username.toLowerCase() === username.toLowerCase() && user.password === password);
      if (foundUser) {
        // Attempt to load existing profile from currentUser, otherwise create one.
        let userProfile = storage.getCurrentUser();
        // This check ensures we load the correct profile if a different user was logged in.
        if (!userProfile || userProfile.username !== foundUser.username) {
            userProfile = { username: foundUser.username, credits: storage.getUserProgress(foundUser.username).ongoingAdventures.length > 0 ? 750 : 500, status: 'Operational' };
        }
        storage.saveCurrentUser(userProfile);
        onAuthSuccess(userProfile);
      } else {
        setError('Invalid credentials. Check your username and password.');
        setLoading(false);
      }
    }
  };

  const handleGuestLogin = () => {
      const guestUser: User = { username: 'Nomad', credits: 0, status: 'Untracked' };
      // Don't save guest to persistent local storage, but do trigger auth success
      onAuthSuccess(guestUser);
  };
  
  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setError(null);
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  };

  const inputStyles = "w-full bg-gray-900/50 border-2 border-sky-700/50 focus:border-sky-400 text-sky-200 p-3 text-lg font-body placeholder:text-gray-500 focus:outline-none focus:ring-0 transition-colors";
  const labelStyles = "block text-sky-300 font-semibold mb-2 text-lg font-body";

  return (
    <div className="w-full max-w-md mx-auto p-8 cyber-panel">
      <h2 className="font-display text-4xl font-bold text-glow text-center mb-8">
        {mode === 'signin' ? 'SYSTEM ACCESS' : 'CREATE IDENTITY'}
      </h2>

      {error && (
        <div className="bg-red-900/80 border-l-4 border-red-500 text-red-200 p-4 mb-6" role="alert">
          <p className="font-bold font-display">// AUTH_ERROR</p>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleAuth} className="space-y-6">
        <div>
          <label htmlFor="username" className={labelStyles}>Datatag // (Username)</label>
          <input type="text" id="username" value={username} onChange={e => setUsername(e.target.value)} required className={inputStyles} />
        </div>
        <div>
          <label htmlFor="password" className={labelStyles}>Passkey // (Password)</label>
          <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required className={inputStyles} />
        </div>
        {mode === 'signup' && (
          <div>
            <label htmlFor="confirmPassword" className={labelStyles}>Confirm Passkey</label>
            <input type="password" id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className={inputStyles} />
          </div>
        )}
        <div>
          <button type="submit" disabled={loading} className="w-full font-display font-bold text-xl text-black bg-sky-400 p-4 border-2 border-sky-400 hover:bg-sky-300 hover:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200 disabled:bg-gray-600 disabled:cursor-wait transition-all duration-200">
            {loading ? 'CONNECTING...' : (mode === 'signin' ? '>> CONNECT <<' : '>> REGISTER <<')}
          </button>
        </div>
      </form>

      <div className="mt-8 text-center">
        <button onClick={toggleMode} className="font-body font-semibold text-sky-300 hover:text-sky-100 hover:underline transition-colors">
          {mode === 'signin' ? 'Need an ID? Create a new identity.' : 'Already have an ID? Access the system.'}
        </button>
      </div>

      <div className="mt-8 pt-6 border-t-2 border-sky-500/30">
        <ChoiceButton text="> Continue as a Nomad (Guest)" onClick={handleGuestLogin} disabled={loading} />
      </div>
    </div>
  );
};

export default Auth;