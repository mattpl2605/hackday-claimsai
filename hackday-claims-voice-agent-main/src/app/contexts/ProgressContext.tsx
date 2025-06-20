"use client";

import React, { createContext, useContext, useState, useEffect, FC, PropsWithChildren } from 'react';

interface AgentProgress {
  passed: boolean;
  bestScore: number;
  attempts: number;
  lastAttemptDate: string;
}

interface ProgressState {
  customerAutoAgent: AgentProgress;
  customerConfusedElderlyAgent: AgentProgress;
  customerCustomerServiceAgent: AgentProgress;
  customerHomeWaterAgent: AgentProgress;
  customerHouseFireAgent: AgentProgress;
  customerWindshieldDamageAgent: AgentProgress;
}

interface ProgressContextType {
  progress: ProgressState;
  updateProgress: (agentName: string, score: number) => void;
  resetProgress: () => void;
  hasPassedAll: () => boolean;
}

const initialState: ProgressState = {
  customerAutoAgent: { attempts: 0, bestScore: 0, passed: false, lastAttemptDate: '' },
  customerConfusedElderlyAgent: { attempts: 0, bestScore: 0, passed: false, lastAttemptDate: '' },
  customerCustomerServiceAgent: { attempts: 0, bestScore: 0, passed: false, lastAttemptDate: '' },
  customerHomeWaterAgent: { attempts: 0, bestScore: 0, passed: false, lastAttemptDate: '' },
  customerHouseFireAgent: { attempts: 0, bestScore: 0, passed: false, lastAttemptDate: '' },
  customerWindshieldDamageAgent: { attempts: 0, bestScore: 0, passed: false, lastAttemptDate: '' },
};

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: FC<PropsWithChildren> = ({ children }) => {
  const [progress, setProgress] = useState<ProgressState>(() => {
    if (typeof window === 'undefined') {
      return initialState;
    }
    try {
      const savedProgress = localStorage.getItem('progress');
      const loadedProgress = savedProgress ? JSON.parse(savedProgress) : {};
      // Merge with initial state to ensure all agents are present
      return { ...initialState, ...loadedProgress };
    } catch (error) {
      console.error("Failed to parse progress from localStorage", error);
      return initialState;
    }
  });

  useEffect(() => {
    localStorage.setItem('progress', JSON.stringify(progress));
    console.log('Saving progress to localStorage:', progress);
  }, [progress]);

  const updateProgress = (agentName: string, score: number) => {
    console.log(`Updating progress for ${agentName} with score ${score}`);
    setProgress(prev => {
      const agentKey = agentName as keyof ProgressState;
      const current = prev[agentKey];
      console.log(`Current progress for ${agentName}:`, current);
      
      const passed = score >= 80;
      const newBestScore = Math.max(current.bestScore, score);
      const newAttempts = current.attempts + 1;
      
      const newProgress = {
        ...prev,
        [agentKey]: {
          passed: passed || current.passed, // Once passed, always passed
          bestScore: newBestScore,
          attempts: newAttempts,
          lastAttemptDate: new Date().toISOString(),
        }
      };
      
      console.log(`New progress for ${agentName}:`, newProgress[agentKey]);
      console.log(`Attempt count for ${agentName}: ${newAttempts}`);
      return newProgress;
    });
  };

  const resetProgress = () => {
    console.log('Resetting all progress');
    setProgress(initialState);
  };

  const hasPassedAll = () => {
    return Object.values(progress).every(agent => agent.passed);
  };

  return (
    <ProgressContext.Provider value={{ progress, updateProgress, resetProgress, hasPassedAll }}>
      {children}
    </ProgressContext.Provider>
  );
};

export function useProgress() {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
} 