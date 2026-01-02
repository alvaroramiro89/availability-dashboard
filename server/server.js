const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'availability.json');

// Middleware
app.use(cors());
app.use(express.json());

// Servir el dashboard HTML
app.get('/', (req, res) => {
  const dashboardPath = path.join(__dirname, '..', 'dashboard.html');
  res.sendFile(dashboardPath);
});

// Asegurar que el directorio de datos existe
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, '{}');
}

// Helper functions
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

// Generar todos los días del año 2026
function getAll2026Dates() {
  const dates = [];
  const year = 2026;
  
  // Generar todos los días del año 2026
  for (let month = 0; month < 12; month++) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      dates.push(formatDateKey(date));
    }
  }
  
  return dates;
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Verificar si una fecha es fin de semana (sábado = 6, domingo = 0)
function isWeekend(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // 0 = domingo, 6 = sábado
}

// Generar 24 bloques de horas (0-23)
function generateTimeSlots() {
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    const nextHour = hour === 23 ? 0 : hour + 1;
    slots.push(`${hour}-${nextHour}`);
  }
  return slots;
}

// GET /api/availability - Devuelve todos los días del 2026
app.get('/api/availability', (req, res) => {
  const data = readData();
  const dates = getAll2026Dates();
  const result = {};
  let hasChanges = false;
  
  // Inicializar estructura si no existe
  dates.forEach(date => {
    if (!data[date]) {
      data[date] = {};
      hasChanges = true;
    }
    
    // Asegurar que todos los miembros tienen todos los slots
    const members = ['Alvaro', 'Pablo', 'Diego', 'Bruno'];
    const slots = generateTimeSlots();
    
    // Todos los slots empiezan en rojo (false = no disponible) por defecto
    const defaultValue = false;
    
    members.forEach(member => {
      if (!data[date][member]) {
        data[date][member] = {};
        hasChanges = true;
      }
      slots.forEach(slot => {
        if (data[date][member][slot] === undefined) {
          data[date][member][slot] = defaultValue;
          hasChanges = true;
        }
      });
    });
    
    result[date] = data[date];
  });
  
  // Solo guardar si hubo cambios (evita escrituras innecesarias)
  if (hasChanges) {
    writeData(data);
  }
  
  res.json(result);
});

// POST /api/availability - Actualiza un slot (mantener para compatibilidad)
app.post('/api/availability', (req, res) => {
  const { date, member, slot, available } = req.body;
  
  // Validaciones
  if (!date || !member || !slot || typeof available !== 'boolean') {
    return res.status(400).json({ 
      error: 'Missing required fields: date, member, slot, available' 
    });
  }
  
  const members = ['Alvaro', 'Pablo', 'Diego', 'Bruno'];
  if (!members.includes(member)) {
    return res.status(400).json({ error: 'Invalid member' });
  }
  
  const slots = generateTimeSlots();
  if (!slots.includes(slot)) {
    return res.status(400).json({ error: 'Invalid time slot' });
  }
  
  // Leer y actualizar
  const data = readData();
  if (!data[date]) {
    data[date] = {};
  }
  if (!data[date][member]) {
    data[date][member] = {};
  }
  
  data[date][member][slot] = available;
  writeData(data);
  
  res.json({ 
    success: true,
    message: 'Actualizado OK',
    date, 
    member, 
    slot, 
    available 
  });
});

// POST /api/availability/batch - Actualiza múltiples slots a la vez
app.post('/api/availability/batch', (req, res) => {
  const { changes } = req.body;
  
  if (!Array.isArray(changes) || changes.length === 0) {
    return res.status(400).json({ 
      error: 'Missing or empty changes array' 
    });
  }
  
  const members = ['Alvaro', 'Pablo', 'Diego', 'Bruno'];
  const slots = generateTimeSlots();
  const data = readData();
  let updatedCount = 0;
  
  // Validar y aplicar todos los cambios
  for (const change of changes) {
    const { date, member, slot, available } = change;
    
    // Validaciones
    if (!date || !member || !slot || typeof available !== 'boolean') {
      continue; // Saltar cambios inválidos
    }
    
    if (!members.includes(member)) {
      continue;
    }
    
    if (!slots.includes(slot)) {
      continue;
    }
    
    // Aplicar cambio
    if (!data[date]) {
      data[date] = {};
    }
    if (!data[date][member]) {
      data[date][member] = {};
    }
    
    data[date][member][slot] = available;
    updatedCount++;
  }
  
  // Guardar todos los cambios de una vez
  writeData(data);
  
  res.json({ 
    success: true,
    message: `${updatedCount} cambio${updatedCount !== 1 ? 's' : ''} actualizado${updatedCount !== 1 ? 's' : ''} correctamente`,
    updatedCount
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    dataFile: fs.existsSync(DATA_FILE) ? 'exists' : 'missing'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Data file: ${DATA_FILE}`);
});

