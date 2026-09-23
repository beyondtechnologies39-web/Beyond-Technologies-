/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { CartItem, Product } from './types';
import { INITIAL_PRODUCTS } from './data/products';
import { Storefront } from './components/Storefront';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminAuthLock } from './components/AdminAuthLock';
import { CartDrawer } from './components/CartDrawer';
import { ProductDetailModal } from './components/ProductDetailModal';

const checkIsAdminRoute = () => {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  return (
    path === '/admin' ||
    path.startsWith('/admin/') ||
    hash === '#admin' ||
    hash === '#/admin' ||
    hash.startsWith('#/admin')
  );
};

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return checkIsAdminRoute() ? '/admin' : '/';
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('beyondtech-admin-auth') === 'true';
    } catch {
      return false;
    }
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('beyondtech-catalog');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return INITIAL_PRODUCTS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('beyondtech-cart');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('beyondtech-theme') === 'dark';
    } catch {
      return false;
    }
  });

  // Apply theme to document
  useEffect(() => {
    const theme = isDarkMode ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('beyondtech-theme', theme);
    } catch {}
  }, [isDarkMode]);

  // Handle browser back/forward buttons and hash changes
  useEffect(() => {
    const handleRouteChange = () => {
      setCurrentRoute(checkIsAdminRoute() ? '/admin' : '/');
    };
    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);

  // Real-time synchronization across browser tabs and windows
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel('beyondtech_catalog_sync');
        channel.onmessage = (event) => {
          if (event.data?.type === 'CATALOG_UPDATED' && Array.isArray(event.data.products)) {
            setProducts(event.data.products);
          }
        };
      }
    } catch {}

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'beyondtech-catalog' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProducts(parsed);
          }
        } catch {}
      }
    };

    const handleCustomSync = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (Array.isArray(customEvent.detail)) {
        setProducts(customEvent.detail);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('beyondtech-catalog-sync', handleCustomSync);

    return () => {
      try {
        channel?.close();
      } catch {}
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('beyondtech-catalog-sync', handleCustomSync);
    };
  }, []);

  // Fetch live products from backend if running with API server
  useEffect(() => {
    fetch('/api/products')
      .then((res) => {
        if (!res.ok) throw new Error('Network response not ok');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
          try {
            localStorage.setItem('beyondtech-catalog', JSON.stringify(data));
          } catch {}
        }
      })
      .catch(() => {
        // Fallback to local catalog already initialized
      });
  }, []);

  // Save cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('beyondtech-cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  // Handle direct product URL links (e.g. from WhatsApp shares: /?product=3)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const productId = params.get('product');
      if (productId && products.length > 0) {
        const found = products.find((p) => String(p.id) === productId);
        if (found) {
          setSelectedProduct(found);
        }
      }
    } catch {}
  }, [products]);

  const navigateTo = useCallback((path: string) => {
    setCurrentRoute(path);
    window.history.pushState({}, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Cart operations
  const handleAddToCart = useCallback((product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  }, []);

  const handleUpdateQuantity = useCallback((productId: number, newQty: number) => {
    setCart((prevCart) => {
      if (newQty <= 0) {
        return prevCart.filter((item) => item.product.id !== productId);
      }
      return prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity: newQty } : item
      );
    });
  }, []);

  const handleRemoveCartItem = useCallback((productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  }, []);

  const handleClearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Admin Catalog operations
  const handleSaveProduct = async (productData: Partial<Product> & { id?: number }) => {
    let updatedProducts: Product[];

    if (productData.id) {
      // Edit existing product
      updatedProducts = products.map((p) =>
        p.id === productData.id ? ({ ...p, ...productData, updatedAt: new Date().toISOString() } as Product) : p
      );
      // Attempt API PUT
      try {
        await fetch(`/api/products/${productData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        });
      } catch {}
    } else {
      // New product
      const nextId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
      const newProduct: Product = {
        id: nextId,
        name: productData.name || 'New Hardware',
        category: productData.category || 'TV Appliances',
        description: productData.description || '',
        price: String(productData.price || '99.00'),
        rating: '5.0',
        reviews: 1,
        badge: productData.badge || 'NEW',
        image:
          productData.image ||
          'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=900&q=86',
        featured: !!productData.featured,
        inventory: Number(productData.inventory) || 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updatedProducts = [newProduct, ...products];
      // Attempt API POST
      try {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProduct),
        });
      } catch {}
    }

    setProducts(updatedProducts);

    // If customer has the detail modal open for this product, update it in real time
    if (selectedProduct) {
      const refreshed = updatedProducts.find((p) => p.id === selectedProduct.id);
      if (refreshed) {
        setSelectedProduct(refreshed);
      }
    }

    try {
      localStorage.setItem('beyondtech-catalog', JSON.stringify(updatedProducts));
      // Broadcast to other tabs & windows
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('beyondtech_catalog_sync');
        channel.postMessage({ type: 'CATALOG_UPDATED', products: updatedProducts });
        channel.close();
      }
      window.dispatchEvent(new CustomEvent('beyondtech-catalog-sync', { detail: updatedProducts }));
    } catch {}
  };

  const handleDeleteProduct = async (productId: number) => {
    const updated = products.filter((p) => p.id !== productId);
    setProducts(updated);
    if (selectedProduct && selectedProduct.id === productId) {
      setSelectedProduct(null);
    }
    try {
      localStorage.setItem('beyondtech-catalog', JSON.stringify(updated));
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('beyondtech_catalog_sync');
        channel.postMessage({ type: 'CATALOG_UPDATED', products: updated });
        channel.close();
      }
      window.dispatchEvent(new CustomEvent('beyondtech-catalog-sync', { detail: updated }));
      await fetch(`/api/products/${productId}`, { method: 'DELETE' });
    } catch {}
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {currentRoute === '/admin' ? (
        isAdminAuthenticated ? (
          <AdminDashboard
            products={products}
            onNavigateStore={() => navigateTo('/')}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
            onLockPanel={() => {
              setIsAdminAuthenticated(false);
              try {
                sessionStorage.removeItem('beyondtech-admin-auth');
              } catch {}
            }}
          />
        ) : (
          <AdminAuthLock
            onAuthenticated={() => {
              setIsAdminAuthenticated(true);
              try {
                sessionStorage.setItem('beyondtech-admin-auth', 'true');
              } catch {}
            }}
            onBackToStore={() => navigateTo('/')}
          />
        )
      ) : (
        <Storefront
          products={products}
          onAddToCart={handleAddToCart}
          cartCount={totalCartCount}
          onOpenCart={() => setIsCartOpen(true)}
          onSelectProduct={(p) => setSelectedProduct(p)}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode((prev) => !prev)}
          onNavigateAdmin={() => navigateTo('/admin')}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />
    </>
  );
}
