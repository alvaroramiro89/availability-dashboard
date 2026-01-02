import { useState, useEffect, useCallback, useRef } from 'react';
import { getAvailability, saveAvailabilityBatch } from '../utils/api';
import { canMakeUpdate, recordUpdate, RATE_LIMIT_COUNT } from '../utils/rateLimit';
import type { AvailabilityData, PendingChange } from '../types';

interface UseAvailabilityOptions {
  selectedMemberName?: string | null;
}

export function useAvailability(options?: UseAvailabilityOptions) {
  const [availabilityData, setAvailabilityData] = useState<AvailabilityData>({});
  const [pendingChanges, setPendingChanges] = useState<Map<string, boolean>>(new Map());
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  
  // Use refs to access current values in callbacks
  const availabilityDataRef = useRef(availabilityData);
  const pendingChangesRef = useRef(pendingChanges);
  
  useEffect(() => {
    availabilityDataRef.current = availabilityData;
  }, [availabilityData]);
  
  useEffect(() => {
    pendingChangesRef.current = pendingChanges;
  }, [pendingChanges]);

  useEffect(() => {
    loadAvailability();
    const storedLastUpdated = localStorage.getItem('last-updated');
    if (storedLastUpdated) {
      setLastUpdated(new Date(storedLastUpdated));
    }
  }, []);

  const loadAvailability = async () => {
    setIsLoading(true);
    try {
      const data = await getAvailability();
      setAvailabilityData(data);
    } catch (error) {
      console.error('Error loading availability:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailabilityState = useCallback((dateKey: string, memberName: string, slot: string): boolean => {
    // Check pending changes first
    const changeKey = `${dateKey}|${memberName}|${slot}`;
    if (pendingChanges.has(changeKey)) {
      return pendingChanges.get(changeKey)!;
    }
    
    // Check saved data
    if (!availabilityData[dateKey]) return false;
    if (!availabilityData[dateKey][memberName]) return false;
    return availabilityData[dateKey][memberName][slot] === true;
  }, [availabilityData, pendingChanges]);

  const toggleAvailability = useCallback((dateKey: string, memberName: string, slot: string) => {
    const changeKey = `${dateKey}|${memberName}|${slot}`;
    
    // Get current state using refs to ensure we have the latest values
    const currentPending = pendingChangesRef.current;
    const currentData = availabilityDataRef.current;
    
    // Determine current state
    let currentState = false;
    if (currentPending.has(changeKey)) {
      currentState = currentPending.get(changeKey)!;
    } else if (currentData[dateKey]?.[memberName]?.[slot] === true) {
      currentState = true;
    }
    
    const newState = !currentState;
    
    // Update both states
    setPendingChanges((prevPending) => {
      const newPendingMap = new Map(prevPending);
      newPendingMap.set(changeKey, newState);
      return newPendingMap;
    });
    
    setAvailabilityData((prevData) => {
      const newData = { ...prevData };
      if (!newData[dateKey]) newData[dateKey] = {};
      if (!newData[dateKey][memberName]) newData[dateKey][memberName] = {};
      newData[dateKey][memberName][slot] = newState;
      return newData;
    });
  }, []);

  const saveAllChanges = async () => {
    // Si no hay cambios pendientes, simplemente retornar sin error
    if (pendingChanges.size === 0) {
      return { success: true, message: 'No hay cambios para guardar', updatedCount: 0 };
    }

    // Verificar rate limiting
    const memberName = options?.selectedMemberName;
    if (memberName) {
      const rateLimit = canMakeUpdate(memberName);
      if (!rateLimit.allowed) {
        const errorMessage = `Límite alcanzado: Solo puedes hacer ${RATE_LIMIT_COUNT} updates cada 15 minutos. Intenta nuevamente en ${rateLimit.resetIn} minuto${rateLimit.resetIn > 1 ? 's' : ''}.`;
        setRateLimitError(errorMessage);
        throw new Error(errorMessage);
      }
      setRateLimitError(null);
    }

    const changes: PendingChange[] = Array.from(pendingChanges.entries()).map(
      ([key, available]) => {
        const [date, member, slot] = key.split('|');
        return { date, member, slot, available };
      }
    );

    try {
      const result = await saveAvailabilityBatch(changes);
      
      // Registrar el update para rate limiting
      if (memberName) {
        recordUpdate(memberName);
      }
      
      setPendingChanges(new Map());
      const now = new Date();
      setLastUpdated(now);
      localStorage.setItem('last-updated', now.toISOString());
      await loadAvailability(); // Reload to sync
      return result;
    } catch (error) {
      console.error('Error saving changes:', error);
      throw error;
    }
  };

  return {
    availabilityData,
    pendingChanges,
    lastUpdated,
    isLoading,
    rateLimitError,
    toggleAvailability,
    getAvailabilityState,
    saveAllChanges,
    loadAvailability,
  };
}

