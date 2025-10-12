import { Request, Response } from 'express';

// Sitemap generator for AutoMentor
export function generateSitemap(req: Request, res: Response) {
  // Use custom domain if in production, otherwise use request host
  const host = req.get('host');
  const baseUrl = (host?.includes('render.com') || host?.includes('localhost')) 
    ? req.protocol + '://' + req.get('host')
    : 'https://chatwithmechanic.com';
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: '1.0'
    },
    {
      url: `${baseUrl}/pricing`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: '0.9'
    },
    {
      url: `${baseUrl}/how-it-works`,
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: '0.8'
    },
    {
      url: `${baseUrl}/contact`,
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: '0.7'
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastmod: new Date().toISOString(),
      changefreq: 'yearly',
      priority: '0.5'
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastmod: new Date().toISOString(),
      changefreq: 'yearly',
      priority: '0.5'
    },
    {
      url: `${baseUrl}/about`,
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: '0.6'
    },
    {
      url: `${baseUrl}/faq`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: '0.7'
    }
  ];

  // Generate XML sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${staticPages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  res.set('Content-Type', 'application/xml');
  res.send(sitemap);
}

// Robots.txt generator
export function generateRobots(req: Request, res: Response) {
  // Use custom domain if in production, otherwise use request host
  const host = req.get('host');
  const baseUrl = (host?.includes('render.com') || host?.includes('localhost')) 
    ? req.protocol + '://' + req.get('host')
    : 'https://chatwithmechanic.com';
  
  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /private/
Disallow: /temp/

# Special rules for search engine bots
User-agent: Googlebot
Allow: /
Disallow: /admin
Disallow: /api/
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Disallow: /admin
Disallow: /api/
Crawl-delay: 1

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Additional SEO directives
# Allow access to CSS and JS for better rendering
Allow: *.css
Allow: *.js
Allow: *.png
Allow: *.jpg
Allow: *.jpeg
Allow: *.gif
Allow: *.svg
Allow: *.webp`;

  res.set('Content-Type', 'text/plain');
  res.send(robots);
}