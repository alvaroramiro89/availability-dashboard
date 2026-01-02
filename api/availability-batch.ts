import type { VercelRequest, VercelResponse } from '@vercel/node';

interface Change {
  date: string;
  member: string;
  slot: string;
  available: boolean;
}

interface RequestBody {
  changes: Change[];
}

// TODO: Implementar con GitHub Gist API
// Por ahora solo retorna éxito

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method === 'POST') {
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

      updatedCount++;
      // TODO: Guardar en GitHub Gist aquí
    }

    res.json({
      success: true,
      message: `${updatedCount} cambio${updatedCount !== 1 ? 's' : ''} actualizado${updatedCount !== 1 ? 's' : ''} correctamente`,
      updatedCount,
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

