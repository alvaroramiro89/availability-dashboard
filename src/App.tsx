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
    toggleAvailability,
    getAvailabilityState,
    saveAllChanges,
  } = useAvailability();

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
    const member = TEAM_MEMBERS[pendingMemberIndex];
    if (password === member.password) {
      login(pendingMemberIndex);
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
    } catch (error) {
      console.error('Error saving:', error);
      // Opcional: mostrar mensaje de error al usuario
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

