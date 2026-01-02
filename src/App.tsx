import { useState } from 'react';
import { MemberModal } from './components/MemberModal';
import { PasswordModal } from './components/PasswordModal';
import { ControlCards } from './components/ControlCards';
import { Calendar } from './components/Calendar';
import { DayView } from './components/DayView';
import { useAuth } from './hooks/useAuth';
import { useAvailability } from './hooks/useAvailability';
import { useMobile } from './hooks/useMobile';
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
  const isMobile = useMobile();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingMemberIndex, setPendingMemberIndex] = useState<number | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
  const [selectedDay, setSelectedDay] = useState(new Date(2026, 0, 1)); // For mobile day view
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

  const handlePreviousDay = () => {
    setSelectedDay((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  };

  const handleNextDay = () => {
    setSelectedDay((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 1);
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
    <div className="min-h-screen bg-black p-2 md:p-4 lg:p-8">
      {/* Header with Beefive Branding */}
      <div className="text-center mb-6 md:mb-8">
        {/* Logo/Image */}
        <div className="flex justify-center mb-4">
          <img 
            src="/ImageLandingBeefive.png" 
            alt="Beefive Logo" 
            className="h-12 md:h-16 lg:h-20 w-auto"
          />
        </div>
        
        {/* Title - Montserrat Black, color verde */}
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-beefive-green mb-2 md:mb-3 tracking-tight">
          Dashboard de Disponibilidad
        </h1>
        
        {/* Subtitle - Montserrat Regular, color naranja */}
        <p className="text-base md:text-xl lg:text-2xl font-normal text-beefive-orange">
          Beefive / Kioscoin - Reuniones y Agendamiento
        </p>
      </div>

      {/* Month Selector - Only show on desktop or when in calendar view */}
      {!isMobile && (
        <div className="bg-white rounded-xl shadow-lg p-3 md:p-4 mb-4 md:mb-6 flex items-center justify-between">
          <button
            onClick={() => handleChangeMonth(-1)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 md:px-6 py-2 rounded-lg font-medium transition-colors text-sm md:text-base"
          >
            ← Mes Anterior
          </button>
          <h2 className="text-lg md:text-2xl font-semibold text-gray-800">
            {monthName} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={() => handleChangeMonth(1)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 md:px-6 py-2 rounded-lg font-medium transition-colors text-sm md:text-base"
          >
            Mes Siguiente →
          </button>
        </div>
      )}

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

      {/* Calendar or Day View */}
      {isMobile ? (
        <DayView
          date={selectedDay}
          selectedMember={selectedMember}
          viewAllMembers={viewAllMembers}
          getAvailabilityState={getAvailabilityState}
          onToggleAvailability={toggleAvailability}
          onPreviousDay={handlePreviousDay}
          onNextDay={handleNextDay}
          isMobile={isMobile}
        />
      ) : (
        <Calendar
          currentDate={currentDate}
          selectedMember={selectedMember}
          viewAllMembers={viewAllMembers}
          getAvailabilityState={getAvailabilityState}
          onToggleAvailability={toggleAvailability}
          isMobile={isMobile}
        />
      )}

      {/* Legend - Only show on desktop (mobile has it in DayView) */}
      {!isMobile && (
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border-2 border-beefive-green">
          <h3 className="text-lg md:text-xl font-black text-beefive-green mb-4">
            Referencias de colores:
          </h3>
          <div className="flex flex-wrap gap-4 md:gap-6 items-center">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-green-100 border-2 border-green-500"></div>
              <span className="text-sm md:text-base font-light text-gray-800">Verde - Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-red-100 border-2 border-red-500"></div>
              <span className="text-sm md:text-base font-light text-gray-800">Rojo - No Disponible</span>
            </div>
            <div className="text-xs md:text-sm font-light text-gray-600 italic">Click para cambiar</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

