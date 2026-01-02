interface TimeSlotProps {
  slot: string;
  isAvailable: boolean;
  onClick: () => void;
  isMobile?: boolean;
}

export function TimeSlot({ slot, isAvailable, onClick, isMobile = false }: TimeSlotProps) {
  const baseClasses = "rounded border-2 transition-all cursor-pointer font-medium";
  const mobileClasses = isMobile
    ? "min-h-[44px] min-w-[44px] px-3 py-3 text-sm border-2 active:scale-95"
    : "text-[9px] px-1 py-1 hover:scale-105 hover:shadow-md";
  
  const availableClasses = isAvailable
    ? 'bg-green-50 border-green-500 text-green-700'
    : 'bg-red-50 border-red-500 text-red-700';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseClasses} ${mobileClasses} ${availableClasses}`}
    >
      {slot}
    </button>
  );
}

