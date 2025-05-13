import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SmartPlate',
    short_name: 'SmartPlate',
    icons: [
      {
        src: '/images/logo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/images/logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    start_url: '/',
    display: 'standalone',
    background_color: '#fff',
    theme_color: '#fff',
  };
}
