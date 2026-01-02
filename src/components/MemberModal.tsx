import { TEAM_MEMBERS } from '../utils/constants';

interface MemberModalProps {
  onSelectMember: (index: number) => void;
  isAuthenticated: boolean;
}

export function MemberModal({ onSelectMember, isAuthenticated }: MemberModalProps) {
  if (isAuthenticated) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Elegí qué miembro del equipo eres
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {TEAM_MEMBERS.map((member, index) => (
            <button
              key={member.name}
              onClick={() => onSelectMember(index)}
              className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-transparent hover:border-purple-500 transition-all cursor-pointer bg-white shadow-md hover:shadow-lg"
              style={{ 
                '--hover-color': member.color 
              } as React.CSSProperties}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-2"
                style={{ backgroundColor: member.color }}
              >
                {member.initial}
              </div>
              <span className="text-gray-700 font-medium">{member.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

