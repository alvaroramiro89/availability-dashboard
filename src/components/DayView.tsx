import { TimeSlot } from './TimeSlot';
import { TIME_SLOTS, TEAM_MEMBERS } from '../utils/constants';
import { formatDateKey } from '../utils/dateUtils';
import type { TeamMember } from '../types';

interface DayViewProps {
  date: Date;
  selectedMember: TeamMember | null;
  viewAllMembers: boolean;
  getAvailabilityState: (dateKey: string, memberName: string, slot: string) => boolean;
  onToggleAvailability: (dateKey: string, memberName: string, slot: string) => void;
  onPreviousDay: () => void;
  onNextDay: () => void;
  isMobile: boolean;
}

export function DayView({
  date,
  selectedMember,
  viewAllMembers,
  getAvailabilityState,
  onToggleAvailability,
  onPreviousDay,
  onNextDay,
  isMobile,
}: DayViewProps) {
  const dateKey = formatDateKey(date);
  const membersToShow = viewAllMembers ? TEAM_MEMBERS : selectedMember ? [selectedMember] : [];

  const dayName = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][date.getDay()];
  const dayNumber = date.getDate();
  const monthName = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][date.getMonth()];

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border-2 border-beefive-green">
      {/* Day Header with Navigation */}
      <div className="flex items-center justify-between mb-6 border-2 border-beefive-green rounded-lg p-3 bg-white">
        <button
          onClick={onPreviousDay}
          className="bg-beefive-orange hover:bg-beefive-green text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm md:text-base"
        >
          ← Anterior
        </button>
        <div className="text-center flex-1 mx-4">
          <div className="text-lg md:text-2xl font-black text-beefive-green">{dayName}</div>
          <div className="text-sm md:text-base font-normal text-beefive-orange">
            {dayNumber} de {monthName} {date.getFullYear()}
          </div>
        </div>
        <button
          onClick={onNextDay}
          className="bg-beefive-orange hover:bg-beefive-green text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm md:text-base"
        >
          Siguiente →
        </button>
      </div>

      {/* Members and Time Slots */}
      <div className="space-y-6">
        {membersToShow.map((member) => (
          <div key={member.name} className="border-2 border-beefive-green rounded-lg p-4 bg-white">
            {/* Member Header */}
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: member.color }}
              >
                {member.name[0]}
              </div>
              <h3 className="text-base md:text-lg font-black" style={{ color: member.color }}>
                {member.name}
              </h3>
            </div>

            {/* Time Slots Grid - Responsive */}
            <div className={`grid gap-2 ${isMobile ? 'grid-cols-2' : 'grid-cols-4 md:grid-cols-6'}`}>
              {TIME_SLOTS.map((slot) => {
                const isAvailable = getAvailabilityState(dateKey, member.name, slot);
                return (
                  <TimeSlot
                    key={slot}
                    slot={slot}
                    isAvailable={isAvailable}
                    onClick={() => onToggleAvailability(dateKey, member.name, slot)}
                    isMobile={isMobile}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-300">
        <div className="text-xs md:text-sm font-semibold text-gray-600 mb-2 text-center">
          Referencias:
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:justify-center md:gap-4">
          <div className="flex items-center gap-2 justify-center">
            <div className="w-4 h-4 rounded bg-green-100 border border-green-500"></div>
            <span className="text-xs md:text-sm text-gray-600">Verde = Disponible</span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <div className="w-4 h-4 rounded bg-red-100 border border-red-500"></div>
            <span className="text-xs md:text-sm text-gray-600">Rojo = No Disponible</span>
          </div>
        </div>
      </div>
    </div>
  );
}

