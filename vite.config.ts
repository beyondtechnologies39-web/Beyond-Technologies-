import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function apiPlugin(): Plugin {
  let products = [
    {
      id: 1,
      name: 'Auralite ANC Headphones',
      category: 'Personal Gadgets',
      description: 'Studio-grade quiet with 42 hours of wireless listening.',
      price: '129.99',
      rating: '4.8',
      reviews: 1240,
      badge: 'BESTSELLER',
      image: '/src/assets/images/headphones_product_1790118724848.jpg',
      featured: true,
      inventory: 38,
      createdAt: '2026-09-22T22:31:57.997Z',
      updatedAt: '2026-09-22T22:31:57.997Z',
    },
    {
      id: 2,
      name: 'Beam Mini Projector',
      category: 'TV Appliances',
      description: 'A pocket cinema with sharp 4K input and auto focus.',
      price: '159.99',
      rating: '4.7',
      reviews: 968,
      badge: 'TRENDING',
      image: '/src/assets/images/projector_product_1790118734953.jpg',
      featured: true,
      inventory: 17,
      createdAt: '2026-09-22T22:31:57.997Z',
      updatedAt: '2026-09-22T22:31:57.997Z',
    },
    {
      id: 3,
      name: 'MagDock 3-in-1 Station',
      category: 'Phone Accessories',
      description: 'One sculpted dock for phone, earbuds, and watch.',
      price: '49.99',
      rating: '4.6',
      reviews: 743,
      badge: 'POPULAR',
      image: '/src/assets/images/wireless_dock_product_1790118746259.jpg',
      featured: true,
      inventory: 64,
      createdAt: '2026-09-22T22:31:57.997Z',
      updatedAt: '2026-09-22T22:31:57.997Z',
    },
    {
      id: 4,
      name: 'Halo Ambient Lamp',
      category: 'Smart Home',
      description: 'App-controlled light scenes tuned for work and rest.',
      price: '74.50',
      rating: '4.9',
      reviews: 516,
      badge: 'NEW',
      image: '/src/assets/images/ambient_lamp_product_1790118756303.jpg',
      featured: false,
      inventory: 29,
      createdAt: '2026-09-22T22:31:57.997Z',
      updatedAt: '2026-09-22T22:31:57.997Z',
    },
    {
      id: 5,
      name: 'Pulse Active Watch',
      category: 'Personal Gadgets',
      description: 'A slim health companion with a seven-day battery.',
      price: '189.49',
      rating: '4.8',
      reviews: 892,
      badge: 'STAFF PICK',
      image: '/src/assets/images/smartwatch_product_1790118766353.jpg',
      featured: false,
      inventory: 21,
      createdAt: '2026-09-22T22:31:57.997Z',
      updatedAt: '2026-09-22T22:31:57.997Z',
    },
    {
      id: 6,
      name: 'Arc Soundbar S2',
      category: 'TV Appliances',
      description: 'Room-filling dialogue and bass in one quiet silhouette.',
      price: '219.95',
      rating: '4.7',
      reviews: 407,
      badge: '20% OFF',
      image: '/src/assets/images/soundbar_product_1790118794385.jpg',
      featured: false,
      inventory: 13,
      createdAt: '2026-09-22T22:31:57.997Z',
      updatedAt: '2026-09-22T22:31:57.997Z',
    },
  ];

  return {
    name: 'api-products-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/api/products')) {
          return next();
        }

        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        const pathname = url.pathname;
        const idMatch = pathname.match(/^\/api\/products\/(\d+)$/);

        // GET /api/products
        if (req.method === 'GET') {
          if (idMatch) {
            const id = Number(idMatch[1]);
            const product = products.find((p) => p.id === id);
            if (!product) {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Product not found' }));
              return;
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(product));
            return;
          }

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(products));
          return;
        }

        // Helper to parse JSON body
        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', () => {
          let parsed: any = {};
          try {
            if (body) parsed = JSON.parse(body);
          } catch {}

          // POST /api/products
          if (req.method === 'POST') {
            const nextId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
            const newProduct = {
              id: nextId,
              name: parsed.name || 'Untitled Product',
              category: parsed.category || 'TV Appliances',
              description: parsed.description || '',
              price: String(parsed.price || '0'),
              rating: parsed.rating || '5.0',
              reviews: parsed.reviews || 0,
              badge: parsed.badge || 'NEW',
              image: parsed.image || '',
              featured: !!parsed.featured,
              inventory: Number(parsed.inventory) || 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            products = [newProduct, ...products];
            res.statusCode = 201;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(newProduct));
            return;
          }

          // PUT /api/products/:id
          if (req.method === 'PUT' && idMatch) {
            const id = Number(idMatch[1]);
            const index = products.findIndex((p) => p.id === id);
            if (index === -1) {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Product not found' }));
              return;
            }
            products[index] = {
              ...products[index],
              ...parsed,
              id,
              updatedAt: new Date().toISOString(),
            };
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(products[index]));
            return;
          }

          // DELETE /api/products/:id
          if (req.method === 'DELETE' && idMatch) {
            const id = Number(idMatch[1]);
            products = products.filter((p) => p.id !== id);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
            return;
          }

          next();
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
