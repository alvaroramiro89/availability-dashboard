# Guía de Deployment en Railway

## Pasos para deployar

### 1. Preparar el proyecto

El proyecto ya está configurado con:
- `railway.json` - Configuración de Railway
- `Procfile` - Comando de inicio
- `server.js` - Configurado para usar `process.env.PORT`

### 2. Crear cuenta en Railway

1. Ve a https://railway.app
2. Crea una cuenta (puedes usar GitHub)
3. Haz click en "New Project"

### 3. Conectar el repositorio

**Opción A: Desde GitHub (recomendado)**
1. Sube tu código a GitHub
2. En Railway, selecciona "Deploy from GitHub repo"
3. Selecciona tu repositorio

**Opción B: Desde CLI**
```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

### 4. Configurar Volume para persistencia

**IMPORTANTE**: Para que los datos persistan, necesitas crear un Volume:

1. En tu proyecto de Railway, ve a "Volumes"
2. Click en "New Volume"
3. Nombre: `data`
4. Mount Path: `/server/data`
5. Esto asegura que `availability.json` persista entre reinicios

### 5. Obtener la URL

1. Railway te dará una URL automáticamente (ej: `https://tu-app.railway.app`)
2. Copia esa URL

### 6. Actualizar el frontend

En `dashboard.html`, cambia:
```javascript
const API_URL = 'https://tu-app.railway.app';
```

O mejor aún, usa una variable de entorno o detecta automáticamente:
```javascript
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000' 
  : 'https://tu-app.railway.app';
```

### 7. Deploy del frontend

**Opción A: Vercel (recomendado para frontend estático)**
1. Ve a https://vercel.com
2. Importa tu repositorio
3. Configura:
   - Build Command: (dejar vacío, es HTML estático)
   - Output Directory: (dejar vacío)
4. Deploy

**Opción B: Railway también puede servir el HTML**
- Agregar ruta en `server.js` para servir `dashboard.html`

### 8. Verificar

1. Abre la URL de Railway
2. Verifica que el API responda: `https://tu-app.railway.app/api/health`
3. Abre el dashboard y prueba hacer cambios

## Estructura de archivos

```
/
  dashboard.html          # Frontend
  server/
    server.js            # Backend API
    data/
      availability.json  # Base de datos (persistido en Volume)
  railway.json          # Config Railway
  Procfile              # Comando de inicio
  .railwayignore        # Archivos a ignorar
```

## Variables de entorno

Railway automáticamente inyecta:
- `PORT` - Puerto del servidor (Railway lo asigna)

## Costos

- **Tier gratis**: $5 de crédito gratis/mes
- **Hobby**: $5/mes (suficiente para MVP)
- El Volume es gratis en tier Hobby

## Troubleshooting

### Los datos se pierden
- Verifica que el Volume esté montado correctamente
- Revisa que el path sea `/server/data`

### El servidor no inicia
- Revisa los logs en Railway
- Verifica que `npm start` funcione localmente

### CORS errors
- El servidor ya tiene CORS habilitado
- Verifica que la URL del frontend coincida con la del backend

