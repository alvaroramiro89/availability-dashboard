import type { VercelRequest, VercelResponse } from '@vercel/node';

// TODO: Implementar con GitHub Gist API
// Por ahora retorna estructura vacía

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method === 'GET') {
    // Generar todos los días del 2026
    const dates: string[] = [];
    const year = 2026;

    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        dates.push(`${y}-${m}-${d}`);
      }
    }

    // Estructura inicial vacía (todos en false/rojo)
    const result: Record<string, Record<string, Record<string, boolean>>> = {};
    const members = ['Alvaro', 'Pablo', 'Diego', 'Bruno'];
    const slots: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      const nextHour = hour === 23 ? 0 : hour + 1;
      slots.push(`${hour}-${nextHour}`);
    }

    dates.forEach((date) => {
      result[date] = {};
      members.forEach((member) => {
        result[date][member] = {};
        slots.forEach((slot) => {
          result[date][member][slot] = false; // Todos empiezan en rojo
        });
      });
    });

    res.json(result);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

