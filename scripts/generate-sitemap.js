const fs = require('fs');
const path = require('path');

// Configuration
const domain = 'https://attempt-three.vercel.app'; // Your actual Vercel app domain
const currentDate = new Date().toISOString().split('T')[0];

// Define your complete site structure
const pages = [
    // Main pages (high priority)
    {
        url: '/',
        priority: '1.0',
        changefreq: 'weekly'
    },
    {
        url: '/authorization',
        priority: '0.9',
        changefreq: 'monthly'
    },
    {
        url: '/workouts',
        priority: '0.8',
        changefreq: 'weekly'
    },
    {
        url: '/nutrition',
        priority: '0.8',
        changefreq: 'weekly'
    },
    {
        url: '/progress',
        priority: '0.8',
        changefreq: 'weekly'
    },

    // Auth-related pages
    {
        url: '/auth/signin',
        priority: '0.7',
        changefreq: 'monthly'
    },
    {
        url: '/auth/signup',
        priority: '0.7',
        changefreq: 'monthly'
    },
    {
        url: '/auth/forgot-password',
        priority: '0.6',
        changefreq: 'monthly'
    },
    {
        url: '/auth/reset-password',
        priority: '0.6',
        changefreq: 'monthly'
    },

    // API endpoints (lower priority but important for indexing)
    {
        url: '/api/health',
        priority: '0.3',
        changefreq: 'monthly'
    },
    {
        url: '/api/nutrition/get',
        priority: '0.4',
        changefreq: 'weekly'
    },
    {
        url: '/api/nutrition/save',
        priority: '0.4',
        changefreq: 'weekly'
    },
    {
        url: '/api/workout/get',
        priority: '0.4',
        changefreq: 'weekly'
    },
    {
        url: '/api/workout/save',
        priority: '0.4',
        changefreq: 'weekly'
    },
    {
        url: '/api/training/get',
        priority: '0.4',
        changefreq: 'weekly'
    },
    {
        url: '/api/training/save',
        priority: '0.4',
        changefreq: 'weekly'
    },
    {
        url: '/api/training/get-presets',
        priority: '0.4',
        changefreq: 'weekly'
    },
    {
        url: '/api/training/save-preset',
        priority: '0.4',
        changefreq: 'weekly'
    },
    {
        url: '/api/usda/search',
        priority: '0.3',
        changefreq: 'weekly'
    },
    {
        url: '/api/usda/food',
        priority: '0.3',
        changefreq: 'weekly'
    },
    {
        url: '/api/cnf/search',
        priority: '0.3',
        changefreq: 'weekly'
    },
    {
        url: '/api/cnf/food',
        priority: '0.3',
        changefreq: 'weekly'
    },
    {
        url: '/api/off/search',
        priority: '0.3',
        changefreq: 'weekly'
    },
    {
        url: '/api/off/product',
        priority: '0.3',
        changefreq: 'weekly'
    }
];

// Generate sitemap XML
function generateSitemap() {
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    pages.forEach(page => {
        sitemap += '  <url>\n';
        sitemap += `    <loc>${domain}${page.url}</loc>\n`;
        sitemap += `    <lastmod>${currentDate}</lastmod>\n`;
        sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
        sitemap += `    <priority>${page.priority}</priority>\n`;
        sitemap += '  </url>\n';
    });

    sitemap += '</urlset>';

    return sitemap;
}

// Write sitemap to public directory
function writeSitemap() {
    const sitemapContent = generateSitemap();
    const outputPath = path.join(__dirname, '..', 'public', 'sitemap.xml');

    try {
        fs.writeFileSync(outputPath, sitemapContent);
        console.log('✅ Sitemap generated successfully at:', outputPath);
        console.log(`📅 Generated on: ${currentDate}`);
        console.log(`🌐 Domain: ${domain}`);
        console.log(`📄 Pages: ${pages.length}`);
        console.log('\n📋 Pages included:');
        pages.forEach(page => {
            console.log(`   - ${page.url} (Priority: ${page.priority}, Frequency: ${page.changefreq})`);
        });
    } catch (error) {
        console.error('❌ Error generating sitemap:', error);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    writeSitemap();
}

module.exports = { generateSitemap, writeSitemap };
