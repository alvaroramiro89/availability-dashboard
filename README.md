# Dashboard de Disponibilidad - Beefive / Kioscoin

Sistema simple para gestionar la disponibilidad del equipo y coordinar reuniones.

## Estructura

- `dashboard.html` - Frontend (interfaz web)
- `server/` - Backend API (Node.js/Express)
  - `server.js` - API principal
  - `data/availability.json` - Almacenamiento (se crea automáticamente)

## Setup

### 1. Instalar dependencias del servidor

```bash
cd server
npm install
```

### 2. Iniciar el servidor

```bash
npm run dev
```

El servidor estará corriendo en `http://localhost:3000`

### 3. Abrir el dashboard

Abre `dashboard.html` en tu navegador (puedes usar un servidor local o abrirlo directamente).

## API Endpoints

### GET `/api/availability`
Obtiene la disponibilidad del mes actual y el siguiente.

**Respuesta:**
```json
{
  "2024-10-01": {
    "Alvaro": { "0-1": true, "1-2": false, ... },
    "Pablo": { "0-1": true, "1-2": true, ... },
    ...
  }
}
```

### POST `/api/availability`
Actualiza la disponibilidad de un slot específico.

**Body:**
```json
{
  "date": "2024-10-15",
  "member": "Alvaro",
  "slot": "9-10",
  "available": true
}
```

### GET `/api/health`
Health check del servidor.

## Características

- 24 bloques de horas diarias (0-23)
- 4 miembros del equipo: Alvaro, Pablo, Diego, Bruno
- Vista individual o de todos los miembros
- Persistencia en archivo JSON
- Sincronización en tiempo real entre usuarios

## Notas

- El archivo `availability.json` se crea automáticamente
- Los datos se inicializan con `true` (disponible) por defecto
- El servidor debe estar corriendo para que el dashboard funcione

