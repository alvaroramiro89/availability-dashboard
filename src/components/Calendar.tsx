import { TimeSlot } from './TimeSlot';
import { DAYS, TIME_SLOTS, TEAM_MEMBERS } from '../utils/constants';
import type { TeamMember } from '../types';

interface CalendarProps {
  currentDate: Date;
  selectedMember: TeamMember | null;
  viewAllMembers: boolean;
  getAvailabilityState: (dateKey: string, memberName: string, slot: string) => boolean;
  onToggleAvailability: (dateKey: string, memberName: string, slot: string) => void;
  isMobile?: boolean;
}

export function Calendar({
  currentDate,
  selectedMember,
  viewAllMembers,
  getAvailabilityState,
  onToggleAvailability,
  isMobile = false,
}: CalendarProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const formatDateKey = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const membersToShow = viewAllMembers ? TEAM_MEMBERS : selectedMember ? [selectedMember] : [];

  return (
    <div className="bg-white rounded-xl shadow-lg p-2 md:p-4 mb-6 overflow-x-auto border-2 border-beefive-green">
      <div className={`grid gap-2 min-w-max ${isMobile ? 'grid-cols-1' : 'grid-cols-7'}`}>
        {/* Day headers */}
        {DAYS.map((day) => (
          <div key={day} className="font-black text-beefive-green text-center py-2">
            {day}
          </div>
        ))}

        {/* Empty cells for days before month starts - only on desktop */}
        {!isMobile && Array.from({ length: startingDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[350px]"></div>
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const date = new Date(year, month, day);
          const dateKey = formatDateKey(date);

          return (
            <div
              key={dateKey}
              className={`border-2 border-beefive-green rounded-lg p-2 bg-white ${isMobile ? 'mb-4' : 'min-h-[350px]'}`}
            >
              {/* Day number */}
              <div className="font-black text-beefive-green mb-2 text-center">{day}</div>

              {/* Members */}
              {membersToShow.map((member) => (
                <div key={member.name} className="mb-3">
                  {/* Member name */}
                  <div
                    className="text-xs font-medium mb-1"
                    style={{ color: member.color }}
                  >
                    {member.name}
                  </div>

                  {/* Time slots grid */}
                  <div className={`grid gap-1 ${isMobile ? 'grid-cols-2' : 'grid-cols-3'}`}>
                    {TIME_SLOTS.map((slot) => (
                      <TimeSlot
                        key={slot}
                        slot={slot}
                        isAvailable={getAvailabilityState(dateKey, member.name, slot)}
                        onClick={() => onToggleAvailability(dateKey, member.name, slot)}
                        isMobile={isMobile}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {/* Legend */}
              <div className="mt-3 pt-3 border-t-2 border-beefive-green">
                <div className="text-[8px] font-black text-beefive-green mb-1 text-center">
                  Referencias:
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-green-100 border-2 border-green-500"></div>
                    <span className="text-[8px] font-light text-gray-800">Verde = Disponible</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-red-100 border-2 border-red-500"></div>
                    <span className="text-[8px] font-light text-gray-800">Rojo = No Disponible</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

