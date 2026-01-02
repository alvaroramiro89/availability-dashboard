import { useState, useEffect, useRef } from 'react';
import type { TeamMember } from '../types';

interface PasswordModalProps {
  member: TeamMember;
  onVerify: (password: string) => boolean;
  onCancel: () => void;
}

export function PasswordModal({ member, onVerify, onCancel }: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onVerify(password)) {
      setPassword('');
      setError(false);
    } else {
      setError(true);
      setPassword('');
      inputRef.current?.focus();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-black border-2 border-beefive-green rounded-xl shadow-2xl p-6 md:p-8 max-w-md w-full mx-4">
        <h2 className="text-xl md:text-2xl font-black text-beefive-green mb-2 text-center">
          Ingresá tu contraseña
        </h2>
        <p className="text-sm md:text-base font-light text-beefive-white mb-6 text-center">
          Para <span className="font-bold text-beefive-orange">
            {member.name}
          </span>
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="Contraseña"
              className="w-full px-4 py-3 border-2 border-beefive-green rounded-lg focus:border-beefive-orange focus:outline-none text-center text-xl md:text-2xl tracking-widest bg-black text-beefive-white"
            />
            {error && (
              <p className="text-red-600 text-sm mt-2 text-center">
                Contraseña incorrecta
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-beefive-white px-4 py-3 rounded-lg font-medium transition-colors border-2 border-beefive-green"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-beefive-orange hover:bg-beefive-green text-black px-4 py-3 rounded-lg font-black transition-colors"
            >
              Ingresar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

