import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/admin/'],
    },
    // sitemap: 'https://helpdesk-pdam.vercel.app/sitemap.xml', // Sesuaikan dengan domain asli nantinya
  }
}
