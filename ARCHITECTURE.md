s# Arquitectura del Sistema - Dashboard de Disponibilidad

## 📐 Arquitectura General

### Patrón Arquitectónico
**Cliente-Servidor (Client-Server)** con separación de responsabilidades:

```
┌─────────────────┐         HTTP/REST API         ┌─────────────────┐
│                 │  ────────────────────────────> │                 │
│   Frontend      │                                │    Backend      │
│  (dashboard.html)│  <─────────────────────────── │   (server.js)   │
│                 │         JSON Responses          │                 │
└─────────────────┘                                └─────────────────┘
                                                           │
                                                           ▼
                                                  ┌─────────────────┐
                                                  │  availability   │
                                                  │     .json       │
                                                  │  (File System)  │
                                                  └─────────────────┘
```

## 🏗️ Stack Tecnológico

### Frontend
- **Lenguaje**: JavaScript (ES6+)
- **Framework/Librería**: Vanilla JS (sin framework)
- **UI Framework**: Tailwind CSS (via CDN)
- **Fuente**: Google Fonts (Montserrat)
- **Almacenamiento Local**: localStorage (solo para selección de usuario)
- **Comunicación**: Fetch API (REST)

### Backend
- **Runtime**: Node.js
- **Framework Web**: Express.js 4.18.2
- **Middleware**: 
  - CORS (Cross-Origin Resource Sharing)
  - express.json() (body parser)
- **File System**: Node.js fs (síncrono)
- **Puerto**: 3000

### Persistencia
- **Tipo**: File-based storage
- **Formato**: JSON
- **Ubicación**: `server/data/availability.json`
- **Estrategia**: Write-through (escribe inmediatamente)

## 📁 Estructura del Proyecto

```
artifacts-project/
├── dashboard.html              # Frontend SPA (Single Page Application)
├── README.md                   # Documentación de usuario
├── ARCHITECTURE.md             # Este documento
├── .gitignore                  # Archivos ignorados por Git
└── server/
    ├── server.js               # API REST Server
    ├── package.json            # Dependencias Node.js
    ├── package-lock.json       # Lock de versiones
    └── data/
        └── availability.json  # Base de datos (JSON)
```

## 🔄 Flujo de Datos

### 1. Inicialización
```
Usuario abre dashboard.html
  → JavaScript carga
  → Verifica localStorage para usuario seleccionado
  → Si no hay usuario: muestra modal
  → Si hay usuario: GET /api/availability
  → Servidor lee availability.json
  → Devuelve datos del mes actual + siguiente
  → Frontend renderiza calendario
```

### 2. Actualización de Disponibilidad
```
Usuario hace click en bloque de tiempo
  → toggleAvailability() se ejecuta
  → Actualiza estado local (optimistic update)
  → POST /api/availability con {date, member, slot, available}
  → Servidor valida datos
  → Lee availability.json completo
  → Actualiza objeto en memoria
  → Escribe archivo completo (write-through)
  → Responde {success: true, message: "Actualizado OK"}
  → Frontend muestra mensaje de confirmación
```

### 3. Cambio de Mes
```
Usuario hace click en "Mes Anterior/Siguiente"
  → changeMonth() se ejecuta
  → Actualiza currentDate
  → GET /api/availability (recarga datos)
  → Servidor calcula nuevo rango de fechas
  → Devuelve datos actualizados
  → Frontend re-renderiza calendario
```

## 🎨 Capas del Sistema

### Capa de Presentación (Frontend)
- **Responsabilidad**: UI/UX, interacción del usuario
- **Tecnología**: HTML5, CSS3 (Tailwind), JavaScript
- **Estado Local**: 
  - `selectedPerson`: Usuario actual
  - `viewAllMembers`: Modo de vista
  - `currentDate`: Fecha del calendario
  - `availabilityData`: Cache local de datos

### Capa de Aplicación (Backend API)
- **Responsabilidad**: Lógica de negocio, validación, orquestación
- **Tecnología**: Node.js + Express
- **Endpoints**:
  - `GET /api/availability`: Lectura de datos
  - `POST /api/availability`: Escritura de datos
  - `GET /api/health`: Health check

### Capa de Persistencia
- **Responsabilidad**: Almacenamiento de datos
- **Tecnología**: File System (JSON)
- **Estrategia**: 
  - Lectura: Síncrona (readFileSync)
  - Escritura: Síncrona (writeFileSync)
  - Formato: JSON con indentación (legible)

## 🔌 API REST

### Especificación de Endpoints

#### GET /api/availability
**Descripción**: Obtiene disponibilidad del mes actual y siguiente

**Request**:
- Method: GET
- Headers: None
- Body: None

**Response**:
```json
{
  "2026-01-01": {
    "Alvaro": { "0-1": true, "1-2": false, ... },
    "Pablo": { "0-1": true, "1-2": true, ... },
    "Diego": { ... },
    "Bruno": { ... }
  },
  "2026-01-02": { ... }
}
```

**Lógica**:
1. Calcula fechas del mes actual + siguiente
2. Lee availability.json
3. Inicializa slots faltantes con `true` (disponible)
4. Solo escribe archivo si hubo cambios

#### POST /api/availability
**Descripción**: Actualiza disponibilidad de un slot específico

**Request**:
- Method: POST
- Headers: `Content-Type: application/json`
- Body:
```json
{
  "date": "2026-01-15",
  "member": "Alvaro",
  "slot": "9-10",
  "available": true
}
```

**Response**:
```json
{
  "success": true,
  "message": "Actualizado OK",
  "date": "2026-01-15",
  "member": "Alvaro",
  "slot": "9-10",
  "available": true
}
```

**Validaciones**:
- `date`, `member`, `slot`, `available` requeridos
- `member` debe estar en lista válida
- `slot` debe ser formato válido (0-23)
- `available` debe ser boolean

## 💾 Modelo de Datos

### Estructura JSON
```json
{
  "YYYY-MM-DD": {
    "MemberName": {
      "H-H": boolean,
      ...
    },
    ...
  },
  ...
}
```

### Ejemplo Real
```json
{
  "2026-01-15": {
    "Alvaro": {
      "0-1": true,
      "1-2": false,
      "2-3": true,
      ...
      "23-0": true
    },
    "Pablo": { ... },
    "Diego": { ... },
    "Bruno": { ... }
  }
}
```

### Reglas de Negocio
- **Slots**: 24 bloques por día (0-23 horas)
- **Miembros**: 4 miembros fijos (Alvaro, Pablo, Diego, Bruno)
- **Valor por defecto**: `true` (disponible)
- **Rango de fechas**: Mes actual + siguiente (calculado dinámicamente)

## 🔐 Seguridad y Limitaciones

### Seguridad Actual
- ✅ CORS habilitado (permite requests desde cualquier origen)
- ✅ Validación de datos en backend
- ✅ Manejo de errores básico

### Limitaciones de Seguridad
- ❌ Sin autenticación/autorización
- ❌ Sin rate limiting
- ❌ Sin validación de origen (CORS abierto)
- ❌ Sin encriptación de datos
- ❌ Sin HTTPS (solo HTTP local)

### Limitaciones de Escalabilidad
- **Concurrencia**: Write-through puede causar race conditions
- **Tamaño**: Archivo crece linealmente con días
- **Performance**: Lee/escribe archivo completo en cada operación
- **Escalabilidad**: Máximo ~10 usuarios simultáneos

## 🎯 Patrones de Diseño Utilizados

### 1. **Singleton Pattern**
- Una instancia del servidor Express
- Un archivo de datos compartido

### 2. **Repository Pattern** (implícito)
- `readData()`: Abstrae lectura de archivo
- `writeData()`: Abstrae escritura de archivo

### 3. **Optimistic UI Update**
- Frontend actualiza UI antes de confirmar con servidor
- Revert si falla la operación

### 4. **Guard Pattern**
- `isLoadingAvailability`: Previene requests simultáneos

## 🔄 Ciclo de Vida de los Datos

### Inicialización
1. Servidor inicia
2. Verifica existencia de `availability.json`
3. Si no existe, crea archivo vacío `{}`
4. Frontend solicita datos
5. Servidor inicializa slots faltantes con `true`

### Operaciones CRUD
- **Create**: Inicialización automática de slots
- **Read**: GET /api/availability
- **Update**: POST /api/availability
- **Delete**: No implementado (se puede agregar)

### Persistencia
- **Estrategia**: Write-through (inmediata)
- **Atomicidad**: No garantizada (puede corromperse en crash)
- **Backup**: Manual (copiar archivo)

## 📊 Métricas y Performance

### Tamaño de Datos
- **Por día**: ~400 bytes (4 miembros × 24 slots × ~4 bytes)
- **Por mes**: ~12 KB (30 días)
- **2 meses**: ~24 KB
- **Archivo actual**: ~118 KB (con formato JSON legible)

### Operaciones
- **GET**: ~10-50ms (lectura de archivo)
- **POST**: ~20-100ms (lectura + escritura)
- **Escalabilidad**: ~100 requests/segundo (estimado)

## 🚀 Mejoras Futuras Sugeridas

### Corto Plazo
1. **SQLite**: Migrar de JSON a SQLite (mismo concepto, más robusto)
2. **Autenticación**: Agregar login básico
3. **Validación de slots**: Prevenir escrituras inválidas

### Mediano Plazo
1. **Base de datos real**: PostgreSQL/MySQL
2. **WebSockets**: Actualizaciones en tiempo real
3. **Caché**: Redis para mejorar performance

### Largo Plazo
1. **Microservicios**: Separar lógica de negocio
2. **Containerización**: Docker
3. **CI/CD**: Pipeline de deployment

## 📝 Conclusión

Este es un **MVP (Minimum Viable Product)** diseñado para:
- ✅ Simplicidad máxima
- ✅ Desarrollo rápido
- ✅ Equipo pequeño (4 personas)
- ✅ Uso local/interno

La arquitectura es **monolítica y simple**, perfecta para validar el concepto antes de escalar a una solución más robusta.

