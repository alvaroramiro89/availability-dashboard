import type { AvailabilityData, PendingChange, ApiResponse } from '../types';

const API_URL = import.meta.env.DEV || import.meta.env.MODE === 'development'
  ? 'http://localhost:3000'
  : window.location.origin;

export async function getAvailability(): Promise<AvailabilityData> {
  const response = await fetch(`${API_URL}/api/availability`);
  if (!response.ok) {
    throw new Error('Failed to load availability');
  }
  return await response.json();
}

export async function saveAvailabilityBatch(
  changes: PendingChange[]
): Promise<ApiResponse> {
  const response = await fetch(`${API_URL}/api/availability/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ changes }),
  });

  if (!response.ok) {
    throw new Error('Failed to save availability');
  }

  return await response.json();
}

