import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cuaderno Compartido',
    short_name: 'Cuaderno',
    description: 'Plataforma colaborativa para compartir apuntes escolares',
    start_url: '/',
    display: 'standalone',
    background_color: '#FDFBF7',
    theme_color: '#3B82F6',
    orientation: 'portrait-primary',
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
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
