import type { TeamMember } from '../types';

export const TEAM_MEMBERS: TeamMember[] = [
  { name: 'Alvaro', initial: 'A', color: '#8b5fdc', password: '1' },
  { name: 'Pablo', initial: 'P', color: '#efb810', password: '2' },
  { name: 'Diego', initial: 'D', color: '#10b981', password: '4' },
  { name: 'Bruno', initial: 'B', color: '#3b82f6', password: '3' },
];

export const TIME_SLOTS: string[] = [];
for (let hour = 0; hour < 24; hour++) {
  const nextHour = hour === 23 ? 0 : hour + 1;
  TIME_SLOTS.push(`${hour}-${nextHour}`);
}

export const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

