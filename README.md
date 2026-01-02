# Dashboard de Disponibilidad - React + TypeScript

Sistema de disponibilidad del equipo construido con React, TypeScript y Vite.

## Stack Tecnológico

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Backend**: Vercel Serverless Functions
- **Storage**: GitHub Gist API (gratis, sin límites)

## Características

- ✅ Autenticación con contraseñas por miembro
- ✅ Calendario completo del año 2026
- ✅ 24 bloques de horas diarias
- ✅ Batch updates (cambios pendientes + botón UPDATE)
- ✅ Vista individual o de todos los miembros
- ✅ Persistencia en GitHub Gist
- ✅ 100% gratis en Vercel

## Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## Estructura del Proyecto

```
/
├── src/
│   ├── components/      # Componentes React
│   ├── hooks/           # Custom hooks
│   ├── types/           # TypeScript types
│   ├── utils/           # Utilidades
│   ├── App.tsx          # Componente principal
│   └── main.tsx         # Entry point
├── api/                  # Vercel Serverless Functions
│   ├── availability.ts
│   └── availability-batch.ts
└── public/              # Assets estáticos
```

## Próximos Pasos

1. Implementar GitHub Gist API en las Serverless Functions
2. Configurar variables de entorno
3. Deploy en Vercel

## Notas

- Las Serverless Functions están preparadas pero necesitan implementación de GitHub Gist
- El frontend funciona completamente en modo desarrollo
- Para producción, configurar `GITHUB_TOKEN` en Vercel
