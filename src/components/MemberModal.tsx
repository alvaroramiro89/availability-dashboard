import { TEAM_MEMBERS } from '../utils/constants';

interface MemberModalProps {
  onSelectMember: (index: number) => void;
  isAuthenticated: boolean;
}

export function MemberModal({ onSelectMember, isAuthenticated }: MemberModalProps) {
  if (isAuthenticated) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-black border-2 border-beefive-green rounded-xl shadow-2xl p-6 md:p-8 max-w-md w-full mx-4">
        {/* Beefive Logo */}
        <div className="flex justify-center mb-4">
          <img 
            src="/ImageLandingBeefive.png" 
            alt="Beefive Logo" 
            className="h-10 md:h-12 w-auto"
          />
        </div>
        <h2 className="text-xl md:text-2xl font-black text-beefive-green mb-6 text-center">
          Elegí qué miembro del equipo eres
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {TEAM_MEMBERS.map((member, index) => (
            <button
              key={member.name}
              onClick={() => onSelectMember(index)}
              className="flex flex-col items-center justify-center p-4 md:p-6 rounded-xl border-2 border-beefive-green hover:border-beefive-orange transition-all cursor-pointer bg-black shadow-md hover:shadow-lg"
            >
              <div
                className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white text-xl md:text-2xl font-black mb-2"
                style={{ backgroundColor: member.color }}
              >
                {member.initial}
              </div>
              <span className="font-light text-beefive-white">{member.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

