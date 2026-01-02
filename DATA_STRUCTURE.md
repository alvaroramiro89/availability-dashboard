# 📊 Estructura de Datos y Persistencia

## 🗂️ Estructura del JSON

El JSON guarda **toda la disponibilidad del año 2026** en una estructura anidada de 3 niveles:

```json
{
  "2026-01-01": {
    "Alvaro": {
      "0-1": false,
      "1-2": false,
      "2-3": true,
      "3-4": true,
      ...
      "23-0": false
    },
    "Pablo": {
      "0-1": false,
      "1-2": true,
      ...
    },
    "Diego": { ... },
    "Bruno": { ... }
  },
  "2026-01-02": { ... },
  "2026-01-03": { ... },
  ...
  "2026-12-31": { ... }
}
```

### Niveles de la estructura:

1. **Nivel 1: Fecha** (clave: `"YYYY-MM-DD"`)
   - Ejemplo: `"2026-01-15"`
   - Una entrada por cada día del año 2026 (366 días)

2. **Nivel 2: Miembro del equipo** (clave: nombre del miembro)
   - `"Alvaro"`, `"Pablo"`, `"Diego"`, `"Bruno"`
   - Una entrada por cada miembro del equipo

3. **Nivel 3: Slot de tiempo** (clave: rango de horas)
   - Ejemplo: `"0-1"`, `"5-6"`, `"23-0"`
   - 24 slots por día (0-23 horas)
   - Valor: `true` (verde/disponible) o `false` (rojo/no disponible)

### Ejemplo completo de un día:

```json
{
  "2026-01-15": {
    "Alvaro": {
      "0-1": false,
      "1-2": false,
      "2-3": false,
      "3-4": false,
      "4-5": false,
      "5-6": false,
      "6-7": false,
      "7-8": false,
      "8-9": false,
      "9-10": true,
      "10-11": true,
      "11-12": true,
      "12-13": true,
      "13-14": true,
      "14-15": true,
      "15-16": true,
      "16-17": true,
      "17-18": false,
      "18-19": false,
      "19-20": false,
      "20-21": false,
      "21-22": false,
      "22-23": false,
      "23-0": false
    },
    "Pablo": {
      "0-1": false,
      "1-2": false,
      ...
    },
    "Diego": { ... },
    "Bruno": { ... }
  }
}
```

### Tamaño estimado del JSON:

- **366 días** × **4 miembros** × **24 slots** = **35,136 valores booleanos**
- Cada valor: `true` o `false` (5-6 caracteres con formato JSON)
- **Tamaño aproximado**: ~500KB - 1MB (con indentación)

---

## 🔗 ¿Qué es GitHub Gist?

**GitHub Gist** es un servicio gratuito de GitHub para compartir y guardar fragmentos de código o texto.

### Características relevantes para nuestro proyecto:

1. **Gratis y sin límites** (para uso razonable)
2. **API REST pública** para leer/escribir
3. **Versionado automático** (historial de cambios)
4. **Almacenamiento persistente** (no se borra)
5. **Acceso mediante token** (autenticación)

### Un Gist es como un "archivo en la nube":

```
Gist ID: abc123def456
  └── availability.json (nuestro archivo JSON completo)
```

### Límites de GitHub Gist:

- **Tamaño máximo por archivo**: 1MB (suficiente para nuestro JSON)
- **Límite de requests**: 5,000 por hora (más que suficiente)
- **Sin costo**: 100% gratis

---

## 💾 Cómo guardamos el JSON en Gist

### Flujo actual (local):

```
Frontend → API Server → data-local.json (archivo en disco)
```

### Flujo con Gist (producción):

```
Frontend → Vercel Serverless Function → GitHub Gist API → Gist (nube)
```

### Proceso paso a paso:

#### 1. **Lectura (GET /api/availability)**

```typescript
// 1. Llamar a GitHub Gist API
const gist = await octokit.gists.get({ gist_id: GIST_ID });

// 2. Extraer el contenido del archivo JSON
const content = gist.data.files['availability.json']?.content;

// 3. Parsear JSON
const availabilityData = JSON.parse(content);

// 4. Inicializar datos faltantes (si es primera vez)
// 5. Retornar al frontend
```

#### 2. **Escritura (POST /api/availability/batch)**

```typescript
// 1. Leer Gist actual
const gist = await octokit.gists.get({ gist_id: GIST_ID });

// 2. Parsear JSON existente
let availabilityData = JSON.parse(gist.data.files['availability.json'].content);

// 3. Aplicar cambios del batch
changes.forEach(change => {
  availabilityData[change.date][change.member][change.slot] = change.available;
});

// 4. Actualizar Gist con nuevo JSON
await octokit.gists.update({
  gist_id: GIST_ID,
  files: {
    'availability.json': {
      content: JSON.stringify(availabilityData, null, 2)
    }
  }
});
```

### Unidad mínima de data:

**✅ SÍ, el JSON completo es la unidad mínima**

- **No guardamos cambios individuales** (no es eficiente)
- **Guardamos el JSON completo** cada vez que hay cambios
- **GitHub Gist maneja el versionado** automáticamente

### ¿Por qué guardar el JSON completo?

1. **Simplicidad**: Un solo archivo, fácil de leer/escribir
2. **Consistencia**: Siempre tenemos el estado completo
3. **Versionado**: Gist guarda historial automáticamente
4. **Tamaño manejable**: ~1MB es pequeño para APIs modernas

### Alternativa (más compleja):

Si el JSON creciera mucho, podríamos:
- Dividir por meses (12 archivos)
- Dividir por miembros (4 archivos)
- Usar una base de datos real

**Pero para nuestro caso (4 personas, 1 año): el JSON completo es perfecto.**

---

## 🔐 Autenticación con Gist

### Token de GitHub:

1. Crear un **Personal Access Token** en GitHub
2. Permisos necesarios: `gist` (crear/editar gists)
3. Guardar como variable de entorno: `GITHUB_TOKEN`

### Gist ID:

1. Crear un Gist inicial (manual o automático)
2. Guardar el ID del Gist
3. Guardar como variable de entorno: `GIST_ID`

### Variables de entorno en Vercel:

```
GITHUB_TOKEN = ghp_xxxxxxxxxxxxx
GIST_ID = abc123def456789
```

---

## 📈 Ventajas de usar Gist vs Base de Datos

| Aspecto | Gist | Base de Datos |
|---------|------|---------------|
| **Costo** | ✅ Gratis | ❌ Puede costar |
| **Setup** | ✅ 2 minutos | ❌ Configuración compleja |
| **Límites** | ✅ 1MB/archivo | ✅ Ilimitado |
| **Versionado** | ✅ Automático | ❌ Manual |
| **Backup** | ✅ Automático | ❌ Manual |
| **Para MVP** | ✅ Perfecto | ⚠️ Overkill |

---

## 🎯 Resumen

1. **JSON**: Estructura anidada `fecha → miembro → slot → boolean`
2. **Gist**: Servicio gratuito de GitHub para guardar archivos en la nube
3. **Unidad mínima**: El JSON completo (no cambios individuales)
4. **Ventaja**: Simple, gratis, versionado automático
5. **Perfecto para**: MVP de 4 personas, 1 año de datos

