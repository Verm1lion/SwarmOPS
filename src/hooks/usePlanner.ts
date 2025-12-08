import { useContext } from 'react';
import { PlannerContext } from '../context/PlannerContext';

export function usePlanner() {
  const context = useContext(PlannerContext);
  if (context === undefined) {
    throw new Error('usePlanner must be used within a PlannerProvider');
  }
  return context;
}


