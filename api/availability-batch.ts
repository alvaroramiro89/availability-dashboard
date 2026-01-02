import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Octokit } from '@octokit/rest';

const GIST_ID = process.env.GIST_ID;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GIST_FILENAME = 'availability.json';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

interface Change {
  date: string;
  member: string;
  slot: string;
  available: boolean;
}

interface RequestBody {
  changes: Change[];
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!GIST_ID || !GITHUB_TOKEN) {
    return res.status(500).json({ 
      error: 'Server configuration error: GIST_ID or GITHUB_TOKEN not set.' 
    });
  }

  const { changes } = req.body as RequestBody;

  if (!Array.isArray(changes) || changes.length === 0) {
    return res.status(400).json({
      error: 'Missing or empty changes array',
    });
  }

  // Validar cambios
  const members = ['Alvaro', 'Pablo', 'Diego', 'Bruno'];
  const slots: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    const nextHour = hour === 23 ? 0 : hour + 1;
    slots.push(`${hour}-${nextHour}`);
  }

  try {
    // Leer Gist actual
    const gist = await octokit.gists.get({ gist_id: GIST_ID });
    let availabilityData: Record<string, Record<string, Record<string, boolean>>> = {};

    if (gist.data.files && gist.data.files[GIST_FILENAME]) {
      const content = gist.data.files[GIST_FILENAME]?.content;
      if (content) {
        availabilityData = JSON.parse(content);
      }
    }

    // Aplicar cambios
    let updatedCount = 0;
    for (const change of changes) {
      const { date, member, slot, available } = change;

      if (
        !date ||
        !member ||
        !slot ||
        typeof available !== 'boolean' ||
        !members.includes(member) ||
        !slots.includes(slot)
      ) {
        continue;
      }

      // Inicializar estructura si no existe
      if (!availabilityData[date]) {
        availabilityData[date] = {};
      }
      if (!availabilityData[date][member]) {
        availabilityData[date][member] = {};
      }

      // Actualizar valor
      if (availabilityData[date][member][slot] !== available) {
        availabilityData[date][member][slot] = available;
        updatedCount++;
      }
    }

    // Guardar en Gist
    if (updatedCount > 0) {
      await octokit.gists.update({
        gist_id: GIST_ID,
        files: {
          [GIST_FILENAME]: {
            content: JSON.stringify(availabilityData, null, 2),
          },
        },
      });
    }

    res.json({
      success: true,
      message: `${updatedCount} cambio${updatedCount !== 1 ? 's' : ''} actualizado${updatedCount !== 1 ? 's' : ''} correctamente`,
      updatedCount,
    });
  } catch (error) {
    console.error('Error saving availability batch:', error);
    res.status(500).json({ 
      error: 'Failed to save availability changes.' 
    });
  }
}
