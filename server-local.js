// Servidor local temporal para desarrollo
// Ejecutar con: node server-local.js

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data-local.json');

app.use(cors());
app.use(express.json());

// Asegurar que el archivo existe
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, '{}');
}

function readData() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function getAll2026Dates() {
  const dates = [];
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

// GET /api/availability
app.get('/api/availability', (req, res) => {
  const data = readData();
  const dates = getAll2026Dates();
  const result = {};
  let hasChanges = false;
  
  const members = ['Alvaro', 'Pablo', 'Diego', 'Bruno'];
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    const nextHour = hour === 23 ? 0 : hour + 1;
    slots.push(`${hour}-${nextHour}`);
  }
  
  dates.forEach((date) => {
    if (!data[date]) {
      data[date] = {};
      hasChanges = true;
    }
    
    members.forEach((member) => {
      if (!data[date][member]) {
        data[date][member] = {};
        hasChanges = true;
      }
      slots.forEach((slot) => {
        if (data[date][member][slot] === undefined) {
          data[date][member][slot] = false; // Todos empiezan en rojo
          hasChanges = true;
        }
      });
    });
    
    result[date] = data[date];
  });
  
  if (hasChanges) {
    writeData(data);
  }
  
  res.json(result);
});

// POST /api/availability-batch
app.post('/api/availability-batch', (req, res) => {
  const { changes } = req.body;
  
  if (!Array.isArray(changes) || changes.length === 0) {
    return res.status(400).json({
      error: 'Missing or empty changes array',
    });
  }
  
  const members = ['Alvaro', 'Pablo', 'Diego', 'Bruno'];
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    const nextHour = hour === 23 ? 0 : hour + 1;
    slots.push(`${hour}-${nextHour}`);
  }
  
  const data = readData();
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
    
    if (!data[date]) {
      data[date] = {};
    }
    if (!data[date][member]) {
      data[date][member] = {};
    }
    
    data[date][member][slot] = available;
    updatedCount++;
  }
  
  writeData(data);
  
  res.json({
    success: true,
    message: `${updatedCount} cambio${updatedCount !== 1 ? 's' : ''} actualizado${updatedCount !== 1 ? 's' : ''} correctamente`,
    updatedCount,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Local server running on http://localhost:${PORT}`);
  console.log(`📁 Data file: ${DATA_FILE}`);
});

