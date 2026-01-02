import type { TeamMember } from '../types';

interface ControlCardsProps {
  selectedMember: TeamMember | null;
  viewAllMembers: boolean;
  pendingChangesCount: number;
  lastUpdated: Date | null;
  onToggleView: () => void;
  onLogout: () => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
}

export function ControlCards({
  selectedMember,
  viewAllMembers,
  pendingChangesCount,
  lastUpdated,
  onToggleView,
  onLogout,
  onSave,
  isSaving,
}: ControlCardsProps) {
  const formatLastUpdated = (date: Date | null): string => {
    if (!date) return 'Sin actualizaciones';
    const dateStr = date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const timeStr = date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `Actualizado: ${dateStr} ${timeStr}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
      {/* Card: Visualización */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-5 border-2 border-beefive-green">
        <div className="flex items-center gap-2 mb-4">
          <svg
            className="w-5 h-5 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          <h3 className="text-sm font-black text-beefive-green uppercase tracking-wide">
            Visualización
          </h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 flex-1">
              Vista actual: {viewAllMembers ? 'Todos los miembros' : selectedMember?.name}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onToggleView}
              className="flex-1 bg-beefive-orange hover:bg-beefive-green text-white px-3 md:px-4 py-2.5 rounded-lg font-medium transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5 text-sm md:text-base min-h-[44px]"
            >
              {viewAllMembers ? `Ver Solo ${selectedMember?.name}` : 'Ver Todos'}
            </button>
            <button
              onClick={onLogout}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-3 md:px-4 py-2.5 rounded-lg font-medium transition-all border-2 border-beefive-green text-sm md:text-base min-h-[44px]"
            >
              Cambiar Usuario
            </button>
          </div>
        </div>
      </div>

      {/* Card: Actualiza tu disponibilidad */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-5 border-2 border-beefive-green">
        <div className="flex items-center gap-2 mb-4">
          <svg
            className="w-5 h-5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-sm font-black text-beefive-green uppercase tracking-wide">
            Actualiza tu disponibilidad
          </h3>
        </div>
        <div className="space-y-3">
          <button
            onClick={onSave}
            disabled={isSaving}
            className="w-full bg-beefive-green hover:bg-beefive-orange text-black px-4 md:px-6 py-3 md:py-3 rounded-lg font-black transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-sm text-base md:text-lg min-h-[48px]"
          >
            {isSaving ? 'Guardando...' : `UPDATE${pendingChangesCount > 0 ? ` (${pendingChangesCount})` : ''}`}
          </button>
          <div className="flex items-center justify-between text-xs">
            {pendingChangesCount > 0 && (
              <span className="text-orange-600 font-medium flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{pendingChangesCount} cambio{pendingChangesCount > 1 ? 's' : ''} pendiente{pendingChangesCount > 1 ? 's' : ''}</span>
              </span>
            )}
            <span className="text-gray-500 italic">{formatLastUpdated(lastUpdated)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

