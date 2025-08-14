import { useState, useCallback } from 'react';
import { firebaseAI } from '../lib/firebaseAI';

export interface AIState {
  loading: boolean;
  error: string | null;
}

export const useFirebaseAI = () => {
  const [state, setState] = useState<AIState>({
    loading: false,
    error: null
  });

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const refineLifeGoal = useCallback(async (lifeGoal: {
    title: string;
    description: string;
    category: string;
    timeframe: string;
    vision: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await firebaseAI.refineLifeGoal(lifeGoal);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refine life goal';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateAnnualGoalSuggestions = useCallback(async (lifeGoal: {
    title: string;
    description: string;
    category: string;
    timeframe: string;
    vision: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const suggestions = await firebaseAI.generateAnnualGoalSuggestions(lifeGoal);
      return suggestions;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate suggestions';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateQuarterlyOKRSuggestions = useCallback(async (annualGoal: {
    title: string;
    description: string;
    targetDate: Date;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const suggestions = await firebaseAI.generateQuarterlyOKRSuggestions(annualGoal);
      return suggestions;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate OKR suggestions';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzeWeeklyReview = useCallback(async (reviewData: {
    goals: string[];
    accomplishments: string[];
    challenges: string[];
    priorities: string[];
  }) => {
    setLoading(true);
    setError(null);
    try {
      const analysis = await firebaseAI.analyzeWeeklyReview(reviewData);
      return analysis;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze weekly review';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateLifeGoalSuggestions = useCallback(async (preferences: {
    categories: string[];
    interests: string[];
    values: string[];
    timeframe: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const suggestions = await firebaseAI.generateLifeGoalSuggestions(preferences);
      return suggestions;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate life goal suggestions';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    ...state,
    refineLifeGoal,
    generateAnnualGoalSuggestions,
    generateQuarterlyOKRSuggestions,
    analyzeWeeklyReview,
    generateLifeGoalSuggestions,
  };
};
