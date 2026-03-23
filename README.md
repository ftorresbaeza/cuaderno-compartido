# Cuaderno Compartido

Plataforma colaborativa mobile-first para compartir apuntes escolares mediante imágenes.

## Características

- 📸 **Subida de imágenes**: Desde cámara o galería, optimizadas automáticamente
- 📚 **Asignaturas**: Organiza contenido por materia
- 📅 **Calendario**: Vista mensual con indicadores de actividad
- 🎯 **Eventos**: Tareas, pruebas y actividades
- 🔄 **Colaboración**: Todos los apoderados pueden contribuir
- 📱 **PWA**: Instalable como app en el celular

## Stack Técnico

- **Framework**: Next.js 14 (App Router)
- **Base de datos**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Storage**: Vercel Blob
- **UI**: Tailwind CSS + Radix UI
- **Deploy**: Vercel

## Instalación Local

```bash
npm install
cp .env.local.example .env.local
# Editar .env.local con tus credenciales
npx prisma generate
npx prisma db push
npm run dev
```

## Deploy en Vercel

1. Conectar repositorio en vercel.com
2. Configurar variables de entorno (DATABASE_URL, BLOB_READ_WRITE_TOKEN, CRON_SECRET)
3. Deploy automático

## Licencia

MIT
