import { useState, useEffect } from 'react';
import { TEAM_MEMBERS } from '../utils/constants';
import type { TeamMember } from '../types';

export function useAuth() {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedPerson = localStorage.getItem('selected-person');
    const authenticated = localStorage.getItem('authenticated');

    if (authenticated === 'true' && storedPerson !== null) {
      const personIndex = parseInt(storedPerson);
      if (!isNaN(personIndex) && personIndex >= 0 && personIndex < TEAM_MEMBERS.length) {
        setSelectedMember(TEAM_MEMBERS[personIndex]);
        setIsAuthenticated(true);
      }
    }
  }, []);

  const login = (memberIndex: number, _password: string) => {
    // Autenticación dummy: cualquier contraseña funciona (ignoramos _password)
    // Solo verificar que el índice del miembro sea válido
    if (memberIndex < 0 || memberIndex >= TEAM_MEMBERS.length) {
      return false;
    }
    
    const member = TEAM_MEMBERS[memberIndex];
    setSelectedMember(member);
    setIsAuthenticated(true);
    localStorage.setItem('selected-person', memberIndex.toString());
    localStorage.setItem('authenticated', 'true');
    return true;
  };

  const logout = () => {
    setSelectedMember(null);
    setIsAuthenticated(false);
    localStorage.removeItem('selected-person');
    localStorage.removeItem('authenticated');
  };

  return {
    selectedMember,
    isAuthenticated,
    login,
    logout,
  };
}

