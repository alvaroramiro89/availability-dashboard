interface TimeSlotProps {
  slot: string;
  isAvailable: boolean;
  onClick: () => void;
}

export function TimeSlot({ slot, isAvailable, onClick }: TimeSlotProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-[9px] px-1 py-1 rounded border-2 transition-all hover:scale-105 hover:shadow-md cursor-pointer ${
        isAvailable
          ? 'bg-green-50 border-green-500 text-green-700'
          : 'bg-red-50 border-red-500 text-red-700'
      }`}
    >
      {slot}
    </button>
  );
}

