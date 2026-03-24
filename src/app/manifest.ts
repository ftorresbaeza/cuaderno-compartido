import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cuaderno Compartido',
    short_name: 'Cuadernos',
    description: 'Sube y comparte fotos de cuadernos para mantenerte al día',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#3b82f6',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
