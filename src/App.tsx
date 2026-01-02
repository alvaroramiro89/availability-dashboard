import { useState } from 'react';
import { MemberModal } from './components/MemberModal';
import { PasswordModal } from './components/PasswordModal';
import { ControlCards } from './components/ControlCards';
import { Calendar } from './components/Calendar';
import { useAuth } from './hooks/useAuth';
import { useAvailability } from './hooks/useAvailability';
import { TEAM_MEMBERS } from './utils/constants';

function App() {
  const { selectedMember, isAuthenticated, login, logout } = useAuth();
  const {
    pendingChanges,
    lastUpdated,
    rateLimitError,
    toggleAvailability,
    getAvailabilityState,
    saveAllChanges,
  } = useAvailability({ selectedMemberName: selectedMember?.name || null });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingMemberIndex, setPendingMemberIndex] = useState<number | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
  const [viewAllMembers, setViewAllMembers] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSelectMember = (index: number) => {
    if (isAuthenticated) return;
    setPendingMemberIndex(index);
    setShowPasswordModal(true);
  };

  const handleVerifyPassword = (password: string): boolean => {
    if (pendingMemberIndex === null) return false;
    // Autenticación dummy: cualquier contraseña funciona
    if (password.trim() !== '') {
      login(pendingMemberIndex, password);
      setShowPasswordModal(false);
      setPendingMemberIndex(null);
      return true;
    }
    return false;
  };

  const handleCancelPassword = () => {
    setShowPasswordModal(false);
    setPendingMemberIndex(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await saveAllChanges();
      // Mostrar mensaje de éxito solo si hubo cambios guardados
      if (result && result.updatedCount && result.updatedCount > 0) {
        // Opcional: puedes agregar un toast o mensaje aquí
        console.log('Cambios guardados:', result.message);
      }
    } catch (error: any) {
      console.error('Error saving:', error);
      // El error de rate limit ya está en rateLimitError del hook
      if (error?.message && error.message.includes('Límite alcanzado')) {
        // El mensaje ya está en rateLimitError, no necesitamos hacer nada más
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangeMonth = (direction: number) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  if (!isAuthenticated) {
    return (
      <>
        <MemberModal
          onSelectMember={handleSelectMember}
          isAuthenticated={isAuthenticated}
        />
        {showPasswordModal && pendingMemberIndex !== null && (
          <PasswordModal
            member={TEAM_MEMBERS[pendingMemberIndex]}
            onVerify={handleVerifyPassword}
            onCancel={handleCancelPassword}
          />
        )}
      </>
    );
  }

  const monthName = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][currentDate.getMonth()];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf9ff] to-[#f5f3ff] p-4 md:p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
          Dashboard de Disponibilidad
        </h1>
        <p className="text-lg text-gray-600">
          Beefive / Kioscoin - Reuniones y Agendamiento
        </p>
      </div>

      {/* Month Selector */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6 flex items-center justify-between">
        <button
          onClick={() => handleChangeMonth(-1)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          ← Mes Anterior
        </button>
        <h2 className="text-2xl font-semibold text-gray-800">
          {monthName} {currentDate.getFullYear()}
        </h2>
        <button
          onClick={() => handleChangeMonth(1)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Mes Siguiente →
        </button>
      </div>

      {/* Control Cards */}
      <ControlCards
        selectedMember={selectedMember}
        viewAllMembers={viewAllMembers}
        pendingChangesCount={pendingChanges.size}
        lastUpdated={lastUpdated}
        onToggleView={() => setViewAllMembers(!viewAllMembers)}
        onLogout={logout}
        onSave={handleSave}
        isSaving={isSaving}
      />

      {/* Rate Limit Error Message */}
      {rateLimitError && (
        <div className="bg-red-50 border-2 border-red-500 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-700 font-medium">{rateLimitError}</p>
          </div>
        </div>
      )}

      {/* Calendar */}
      <Calendar
        currentDate={currentDate}
        selectedMember={selectedMember}
        viewAllMembers={viewAllMembers}
        getAvailabilityState={getAvailabilityState}
        onToggleAvailability={toggleAvailability}
      />

      {/* Legend */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Referencias de colores:
        </h3>
        <div className="flex flex-wrap gap-6 items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-green-100 border-2 border-green-500"></div>
            <span className="text-gray-700">Verde - Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-red-100 border-2 border-red-500"></div>
            <span className="text-gray-700">Rojo - No Disponible</span>
          </div>
          <div className="text-sm text-gray-500 italic">Click para cambiar</div>
        </div>
      </div>
    </div>
  );
}

export default App;

