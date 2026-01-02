import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Octokit } from '@octokit/rest';

const GIST_ID = process.env.GIST_ID;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GIST_FILENAME = 'availability.json';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

// Generar todos los días del 2026
function getAll2026Dates() {
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
  return dates;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!GIST_ID || !GITHUB_TOKEN) {
    return res.status(500).json({ 
      error: 'Server configuration error: GIST_ID or GITHUB_TOKEN not set.' 
    });
  }

  try {
    // Leer Gist
    const gist = await octokit.gists.get({ gist_id: GIST_ID });
    let availabilityData: Record<string, Record<string, Record<string, boolean>>> = {};

    if (gist.data.files && gist.data.files[GIST_FILENAME]) {
      const content = gist.data.files[GIST_FILENAME]?.content;
      if (content) {
        availabilityData = JSON.parse(content);
      }
    }

    // Inicializar datos faltantes
    const all2026Dates = getAll2026Dates();
    const members = ['Alvaro', 'Pablo', 'Diego', 'Bruno'];
    const slots: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      const nextHour = hour === 23 ? 0 : hour + 1;
      slots.push(`${hour}-${nextHour}`);
    }

    let hasChanges = false;
    all2026Dates.forEach((date) => {
      if (!availabilityData[date]) {
        availabilityData[date] = {};
        hasChanges = true;
      }
      members.forEach((member) => {
        if (!availabilityData[date][member]) {
          availabilityData[date][member] = {};
          hasChanges = true;
        }
        slots.forEach((slot) => {
          if (availabilityData[date][member][slot] === undefined) {
            availabilityData[date][member][slot] = false; // Todos empiezan en rojo
            hasChanges = true;
          }
        });
      });
    });

    // Si hubo cambios, actualizar Gist
    if (hasChanges) {
      await octokit.gists.update({
        gist_id: GIST_ID,
        files: {
          [GIST_FILENAME]: {
            content: JSON.stringify(availabilityData, null, 2),
          },
        },
      });
    }

    res.json(availabilityData);
  } catch (error) {
    console.error('Error fetching/initializing availability:', error);
    res.status(500).json({ 
      error: 'Failed to fetch or initialize availability data.' 
    });
  }
}
