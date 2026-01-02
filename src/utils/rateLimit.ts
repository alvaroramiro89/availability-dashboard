// Rate limiting: máximo 3 updates en 15 minutos por usuario

export const RATE_LIMIT_COUNT = 3;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutos en milisegundos
const STORAGE_KEY_PREFIX = 'update_timestamps_';

export function getUpdateTimestamps(memberName: string): number[] {
  const key = `${STORAGE_KEY_PREFIX}${memberName}`;
  const stored = localStorage.getItem(key);
  if (!stored) return [];
  
  try {
    const timestamps = JSON.parse(stored) as number[];
    // Filtrar timestamps antiguos (más de 15 minutos)
    const now = Date.now();
    const validTimestamps = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
    
    // Actualizar localStorage con solo los timestamps válidos
    if (validTimestamps.length !== timestamps.length) {
      localStorage.setItem(key, JSON.stringify(validTimestamps));
    }
    
    return validTimestamps;
  } catch {
    return [];
  }
}

export function canMakeUpdate(memberName: string): { allowed: boolean; remaining: number; resetIn: number } {
  const timestamps = getUpdateTimestamps(memberName);
  const now = Date.now();
  
  // Contar updates en la ventana de 15 minutos
  const recentUpdates = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
  
  if (recentUpdates.length >= RATE_LIMIT_COUNT) {
    // Calcular cuándo se puede hacer el próximo update
    const oldestUpdate = Math.min(...recentUpdates);
    const resetTime = oldestUpdate + RATE_LIMIT_WINDOW_MS;
    const resetIn = Math.ceil((resetTime - now) / 1000 / 60); // minutos
    
    return {
      allowed: false,
      remaining: 0,
      resetIn,
    };
  }
  
  return {
    allowed: true,
    remaining: RATE_LIMIT_COUNT - recentUpdates.length,
    resetIn: 0,
  };
}

export function recordUpdate(memberName: string): void {
  const key = `${STORAGE_KEY_PREFIX}${memberName}`;
  const timestamps = getUpdateTimestamps(memberName);
  const now = Date.now();
  
  // Agregar el nuevo timestamp
  timestamps.push(now);
  
  // Mantener solo los timestamps de la ventana de 15 minutos
  const validTimestamps = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
  
  localStorage.setItem(key, JSON.stringify(validTimestamps));
}

