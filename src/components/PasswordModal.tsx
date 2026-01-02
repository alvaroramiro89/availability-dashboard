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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2 text-center">
          Ingresá tu contraseña
        </h2>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Para <span className="font-semibold" style={{ color: member.color }}>
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
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-center text-2xl tracking-widest"
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
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
            >
              Ingresar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

