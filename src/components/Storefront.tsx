import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Flame,
  Heart,
  House,
  HousePlug,
  Info,
  Lock,
  MapPin,
  Menu,
  Minus,
  Moon,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Sun,
  Tag,
  Tv,
  Watch,
  X,
  Zap,
} from 'lucide-react';
import { Product } from '../types';
import { CATEGORIES, formatCurrency } from '../data/products';

export const WhatsAppIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.275-.101-.475-.15-.675.15-.2.301-.776.979-.951 1.18-.175.2-.351.226-.652.075-.301-.15-1.27-.468-2.42-1.493-.894-.798-1.497-1.783-1.673-2.084-.175-.301-.019-.464.132-.614.136-.135.301-.351.451-.527.151-.175.2-.301.301-.501.101-.2.05-.376-.025-.526-.075-.15-.676-1.63-.927-2.233-.244-.588-.493-.508-.676-.517-.175-.009-.376-.009-.576-.009-.2 0-.526.075-.802.376-.276.301-1.052 1.028-1.052 2.508 0 1.48 1.077 2.909 1.228 3.109.15.2 2.12 3.238 5.136 4.542.717.311 1.277.497 1.713.636.72.229 1.375.197 1.893.12.578-.087 1.78-.727 2.03-1.43.251-.703.251-1.305.176-1.43-.075-.126-.276-.201-.577-.352zM12.04 2C6.544 2 2.073 6.47 2.073 11.968c0 1.962.57 3.864 1.646 5.488L2 22l4.707-1.674a9.92 9.92 0 0 0 5.333 1.542h.005c5.495 0 9.965-4.47 9.965-9.968C22.01 6.47 17.535 2 12.04 2zm0 18.067h-.004a8.214 8.214 0 0 1-4.186-1.149l-.3-.178-3.111 1.107 1.127-3.032-.195-.311a8.204 8.204 0 0 1-1.258-4.536c0-4.544 3.697-8.24 8.243-8.24 2.2 0 4.269.858 5.824 2.415a8.188 8.188 0 0 1 2.41 5.825c0 4.545-3.696 8.242-8.243 8.242z" />
  </svg>
);

export const getWhatsAppUrl = (product: Product) => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://beyondtech.store';
  const productUrl = `${origin}/?product=${product.id}`;
  const message = `Hello BeyondTech! I'd like to order:\n*${product.name}*\nPrice: UGX ${Number(product.price).toLocaleString()}\nProduct Link: ${productUrl}\n\nIs this available at your Aponye Mall store?`;
  return `https://wa.me/256753078814?text=${encodeURIComponent(message)}`;
};

interface StorefrontProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  cartCount: number;
  onOpenCart: () => void;
  onSelectProduct: (product: Product) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onNavigateAdmin?: () => void;
}

export const Storefront: React.FC<StorefrontProps> = ({
  products,
  onAddToCart,
  cartCount,
  onOpenCart,
  onSelectProduct,
  isDarkMode,
  onToggleTheme,
  onNavigateAdmin,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('beyondtech-favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Dynamic Banner slider state (auto-rotation + pausable + dynamic progress)
  const [activeSlide, setActiveSlide] = useState(0);
  const [isSlidePaused, setIsSlidePaused] = useState(false);
  const [slideProgressKey, setSlideProgressKey] = useState(0);

  // Dynamic banner auto-slide rotation every 5 seconds (pausable on hover)
  useEffect(() => {
    if (isSlidePaused) return;
    const interval = setInterval(() => {
      setActiveSlide((current) => (current + 1) % 3);
      setSlideProgressKey((k) => k + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [isSlidePaused]);

  const goToSlide = (index: number) => {
    setActiveSlide(index);
    setSlideProgressKey((k) => k + 1);
  };

  // Dynamic featured spotlight item from real-time store catalog
  const featuredProduct = useMemo(() => {
    return products.find((p) => p.featured) || products[0];
  }, [products]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(''), 2400);
  };

  const toggleFavorite = (e: React.MouseEvent, productId: number, productName: string) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const exists = prev.includes(productId);
      const next = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      try {
        localStorage.setItem('beyondtech-favorites', JSON.stringify(next));
      } catch {}
      showToast(exists ? `Removed ${productName} from wishlist` : `Saved ${productName} to wishlist`);
      return next;
    });
  };

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // Capture PWA install prompt for Android / Chrome
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApk = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setIsMobileMenuOpen(false);
    setIsInstallModalOpen(true);
  };

  const handleExploreDeals = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setIsMobileMenuOpen(false);
    setSelectedCategory('All');
    setSearchTerm('');
    const el = document.getElementById('products') || document.querySelector('.products-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    showToast('Showing featured setup upgrade gear');
  };

  const handleOpenNewArrivals = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setIsMobileMenuOpen(false);
    setSelectedCategory('All');
    setSearchTerm('');
    const el = document.querySelector('#products') || document.querySelector('#new');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch = `${p.name} ${p.description} ${p.category} ${p.badge || ''}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory((current) => (current === categoryName ? 'All' : categoryName));
  };

  const getCategoryIcon = (icon: string) => {
    switch (icon) {
      case 'tv':
        return <Tv aria-hidden="true" />;
      case 'phone':
        return <Smartphone aria-hidden="true" />;
      case 'home':
        return <HousePlug aria-hidden="true" />;
      case 'watch':
        return <Watch aria-hidden="true" />;
      default:
        return <Tv aria-hidden="true" />;
    }
  };

  return (
    <div className="site-shell">
      {/* Top Navigation Bar */}
      <header className="topbar">
        <button
          className="icon-button mobile-menu"
          aria-label="Open menu"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu />
        </button>

        <a href="/" className="brand" aria-label="BeyondTech home" onClick={(e) => { e.preventDefault(); setSelectedCategory('All'); setSearchTerm(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <span className="brand-bolt">
            <Zap fill="currentColor" />
          </span>
          <span>
            BEYOND<span>TECH</span>
            <small>FUTURE, UNBOXED.</small>
          </span>
        </a>

        <nav className="desktop-nav" aria-label="Main navigation">
          <button
            onClick={handleOpenNewArrivals}
            style={{
              background: 'transparent',
              border: 0,
              cursor: 'pointer',
              color: selectedCategory === 'All' ? 'var(--blue)' : 'var(--muted)',
              fontSize: '13px',
              fontWeight: 700,
              fontFamily: 'inherit',
              padding: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--blue)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = selectedCategory === 'All' ? 'var(--blue)' : 'var(--muted)')}
          >
            New arrivals
          </button>
          <a href="#categories">Categories</a>
          <button
            onClick={handleInstallApk}
            style={{
              background: 'rgba(7, 95, 228, 0.08)',
              border: '1px solid rgba(7, 95, 228, 0.25)',
              borderRadius: '6px',
              cursor: 'pointer',
              color: 'var(--blue)',
              fontSize: '12px',
              fontWeight: 800,
              fontFamily: 'inherit',
              padding: '5px 10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Smartphone size={14} /> Install APK
          </button>
          <button
            onClick={() => setIsAboutOpen(true)}
            style={{
              background: 'transparent',
              border: 0,
              cursor: 'pointer',
              color: 'var(--muted)',
              fontSize: '13px',
              fontWeight: 700,
              fontFamily: 'inherit',
              padding: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--blue)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
          >
            About us
          </button>
        </nav>

        <div className="header-actions" style={{ position: 'relative' }}>
          <button
            className="icon-button"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun /> : <Moon />}
          </button>

          <button
            className="icon-button desktop-only"
            aria-label="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell />
            <i>2</i>
          </button>

          {showNotifications && (
            <div className="notif-menu">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--blue)', letterSpacing: '1px' }}>
                  ACTIVITY RADAR
                </span>
                <span style={{ fontSize: '10px', color: 'var(--muted)' }}>Just now</span>
              </div>
              <div className="notif-item">
                <b>⚡ 48-Hour Weekend Flash</b>
                Take 20% off selected smart home & audio hardware before midnight.
              </div>
              <div className="notif-item">
                <b>📦 Kampala Express Live</b>
                Same-day motorcycle dispatch active for orders confirmed before 3 PM.
              </div>
            </div>
          )}

          <button
            className="icon-button"
            aria-label={`${cartCount} items in bag`}
            onClick={onOpenCart}
          >
            <ShoppingBag />
            <i>{cartCount}</i>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Search Row */}
        <div className="search-row">
          <Search />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search gadgets, electronics, accessories..."
            aria-label="Search products"
          />
          <button
            aria-label="Search filters"
            onClick={() => {
              if (selectedCategory !== 'All') {
                setSelectedCategory('All');
              } else {
                setSelectedCategory('Personal Gadgets');
              }
            }}
          >
            <SlidersHorizontal />
          </button>
        </div>

        {/* Dynamic Hero Banner */}
        <section
          className="hero dynamic-banner"
          id="new"
          onMouseEnter={() => setIsSlidePaused(true)}
          onMouseLeave={() => setIsSlidePaused(false)}
        >
          {/* Dynamic Progress Indicator */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'rgba(255, 255, 255, 0.08)',
              zIndex: 5,
              overflow: 'hidden',
            }}
          >
            <div
              key={slideProgressKey}
              className="hero-progress-line"
              style={{
                animationPlayState: isSlidePaused ? 'paused' : 'running',
              }}
            />
          </div>

          {/* Slide 0: Dynamic Featured Spotlight */}
          {activeSlide === 0 && (
            <div className="hero-copy dynamic-hero-slide">
              <span className="hero-kicker">
                <Zap size={13} fill="#55a2ff" />
                {featuredProduct?.badge ? `${featuredProduct.badge.toUpperCase()} · ` : ''}FEATURED SPOTLIGHT
              </span>
              <h1>
                UPGRADE YOUR SETUP.
                <br />
                <em>FLAGSHIP HARDWARE.</em>
              </h1>
              <p>
                {featuredProduct
                  ? `${featuredProduct.name} in stock · ${formatCurrency(featuredProduct.price)} with official warranty.`
                  : 'Special prices on verified smart audio, phones, and premium accessories.'}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {featuredProduct && (
                  <button
                    type="button"
                    onClick={() => onSelectProduct(featuredProduct)}
                    style={{ background: 'var(--blue)', color: '#fff', border: 0 }}
                  >
                    VIEW PRODUCT <ArrowRight size={14} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleExploreDeals}
                  className="hero-secondary-btn"
                >
                  EXPLORE ALL
                </button>
              </div>
            </div>
          )}

          {/* Slide 1: Dynamic Curated Electronics */}
          {activeSlide === 1 && (
            <div className="hero-copy dynamic-hero-slide">
              <span className="hero-kicker">
                <Sparkles size={13} color="#55a2ff" />
                {products.length}+ CURATED TECH DROPS · 2026 EDITION
              </span>
              <h1>
                SMART TECH.
                <br />
                <em>BETTER EVERY DAY.</em>
              </h1>
              <p>
                High-performance laptops, studio sound, computing & workspace gear in Kampala.
              </p>
              <button
                type="button"
                onClick={handleOpenNewArrivals}
                style={{ background: 'var(--blue)', color: '#fff', border: 0 }}
              >
                SHOP NEW ARRIVALS <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* Slide 2: Kampala Storefront & WhatsApp */}
          {activeSlide === 2 && (
            <div className="hero-copy dynamic-hero-slide">
              <span className="hero-kicker" style={{ color: '#25d366' }}>
                <MapPin size={13} color="#25d366" />
                APONYE MALL SHOWROOM · CENTRAL KAMPALA
              </span>
              <h1>
                WALK-IN STORE.
                <br />
                <em>TEST BEFORE YOU BUY.</em>
              </h1>
              <p>
                Hands-on demos at Aponye Mall & swift express courier delivery countrywide.
              </p>
              <a
                href="https://wa.me/256753078814"
                target="_blank"
                rel="noopener noreferrer"
                className="hero-whatsapp-btn"
              >
                <WhatsAppIcon size={14} /> ORDER VIA WHATSAPP
              </a>
            </div>
          )}

          {/* Floating dynamic product thumbnail on desktop */}
          {activeSlide === 0 && featuredProduct && (
            <div
              className="hero-floating-product"
              onClick={() => onSelectProduct(featuredProduct)}
              title={`View ${featuredProduct.name}`}
            >
              <img src={featuredProduct.image} alt={featuredProduct.name} />
              <div className="hero-floating-details">
                <span className="floating-badge">{featuredProduct.badge || 'SPOTLIGHT'}</span>
                <strong>{featuredProduct.name}</strong>
                <small>{formatCurrency(featuredProduct.price)}</small>
              </div>
            </div>
          )}

          {/* Background graphic */}
          <div className="hero-art" aria-hidden="true">
            <div className="orb orb-one" />
            <div className="orb orb-two" />
            <div className="device phone-device">
              <span />
              <span />
              <span />
            </div>
            <div className="device headphone-device">B</div>
            <div className="device watch-device">
              10
              <br />
              <small>09</small>
            </div>
            <div className="stage-line" />
          </div>

          {/* Slide Controls (Prev / Next & Dots) */}
          <div className="hero-controls">
            <button
              type="button"
              onClick={() => goToSlide((activeSlide - 1 + 3) % 3)}
              aria-label="Previous banner slide"
              className="hero-nav-arrow"
            >
              <ChevronLeft size={14} />
            </button>
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
              {[0, 1, 2].map((idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goToSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  style={{
                    width: activeSlide === idx ? '18px' : '6px',
                    height: '6px',
                    borderRadius: '4px',
                    background: activeSlide === idx ? '#fff' : 'rgba(255, 255, 255, 0.35)',
                    border: 0,
                    padding: 0,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => goToSlide((activeSlide + 1) % 3)}
              aria-label="Next banner slide"
              className="hero-nav-arrow"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </section>

        {/* Categories Section */}
        <section id="categories" className="category-strip" aria-label="Product categories">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                className={isActive ? 'active' : ''}
                onClick={() => handleCategoryClick(cat.name)}
              >
                <span>{getCategoryIcon(cat.icon)}</span>
                {cat.name}
              </button>
            );
          })}
        </section>

        {/* Products Section */}
        <section className="products-section" id="products">
          <div className="section-heading">
            <div>
              <span className="kicker">CURATED FOR RIGHT NOW</span>
              <h2>
                {selectedCategory === 'All' ? 'Trending electronics' : selectedCategory}
              </h2>
            </div>
            {selectedCategory !== 'All' ? (
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchTerm('');
                }}
              >
                View all <ArrowRight />
              </button>
            ) : (
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchTerm('');
                }}
              >
                View all <ArrowRight />
              </button>
            )}
          </div>

          {filteredProducts.length > 0 ? (
            <div className="product-grid">
              {filteredProducts.map((product) => {
                const isSaved = favorites.includes(product.id);
                return (
                  <article
                    key={product.id}
                    className="product-card cursor-pointer"
                    onClick={() => onSelectProduct(product)}
                  >
                    <div className="product-image">
                      {product.badge && (
                        <span className={`badge badge-${product.badge.length % 3}`}>
                          {product.badge}
                        </span>
                      )}
                      <button
                        className={`heart ${isSaved ? 'active' : ''}`}
                        aria-label={`Save ${product.name}`}
                        onClick={(e) => toggleFavorite(e, product.id, product.name)}
                      >
                        <Heart size={18} fill={isSaved ? '#e02424' : 'none'} color={isSaved ? '#e02424' : 'currentColor'} />
                      </button>
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                    </div>
                    <div className="product-info">
                      <p className="product-category">{product.category}</p>
                      <h3>{product.name}</h3>
                      <div className="rating">
                        <span>★</span> {product.rating} <small>({product.reviews.toLocaleString()})</small>
                      </div>
                      <div className="price-row">
                        <strong>{formatCurrency(product.price)}</strong>
                        <div className="card-actions">
                          <a
                            href={getWhatsAppUrl(product)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="whatsapp-btn whatsapp-icon-btn"
                            onClick={(e) => e.stopPropagation()}
                            title={`Order ${product.name} on WhatsApp`}
                            aria-label={`Order ${product.name} on WhatsApp`}
                          >
                            <WhatsAppIcon size={19} />
                          </a>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToCart(product);
                              showToast(`${product.name} added to your bag`);
                            }}
                            aria-label={`Add ${product.name} to bag`}
                          >
                            <ShoppingBag />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty">
              <Search size={36} style={{ margin: '0 auto 14px', opacity: 0.5 }} />
              <h3>No signal found</h3>
              <p>Try a wider search or clear the category filter.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </section>

        {/* 48-Hour Deal Banner */}
        <section className="deal-banner" id="deals">
          <div>
            <span className="eyebrow">48-HOUR SIGNAL</span>
            <h2>UPGRADE YOUR SETUP.</h2>
            <p>Sharper sound. Smarter lighting. Less cable chaos.</p>
            <button type="button" onClick={handleExploreDeals} style={{ cursor: 'pointer' }}>
              EXPLORE DEALS <ChevronRight />
            </button>
          </div>
          <div className="deal-graphic">
            <span>
              20<small>%</small>
            </span>
            <b>OFF</b>
            <i>SELECTED TECH</i>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="footer-brand">
            <Zap fill="currentColor" />
            BeyondTech
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)' }}>
            Physical Store: <strong style={{ color: 'var(--ink)' }}>Aponye Mall, Kampala, Uganda</strong>
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', fontSize: '12px' }}>
            <a
              href="https://wa.me/256753078814"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#25d366',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <WhatsAppIcon size={14} /> WhatsApp / Orders: +256 753 078 814
            </a>
            <button
              type="button"
              onClick={handleInstallApk}
              style={{
                background: 'rgba(7, 95, 228, 0.1)',
                border: '1px solid rgba(7, 95, 228, 0.3)',
                color: 'var(--blue)',
                fontWeight: 700,
                borderRadius: '6px',
                padding: '4px 10px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
              }}
            >
              <Smartphone size={13} /> Install Android APK (v1.0)
            </button>
            {onNavigateAdmin && (
              <button
                type="button"
                onClick={onNavigateAdmin}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--line)',
                  color: 'var(--muted)',
                  fontWeight: 700,
                  borderRadius: '6px',
                  padding: '4px 10px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '11px',
                }}
                title="BeyondTech Admin / Staff Portal"
              >
                <Lock size={12} /> Staff Admin Portal
              </button>
            )}
            <span style={{ color: 'var(--muted)' }}>• Walk-in Store Pickup & Express Countrywide Delivery</span>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="bottom-nav" aria-label="Mobile navigation">
        <button
          type="button"
          onClick={handleOpenNewArrivals}
          className={selectedCategory === 'All' ? 'active' : ''}
          style={{ background: 'transparent', border: 0 }}
        >
          <House />
          Home
        </button>
        <a
          href="#categories"
          onClick={() => {
            document.querySelector('#categories')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <Minus />
          Categories
        </a>
        <button
          className="shop-fab"
          onClick={() => document.querySelector('#products')?.scrollIntoView({ behavior: 'smooth' })}
          aria-label="Shop catalog"
        >
          <ShoppingBag />
          Shop
        </button>
        <button
          type="button"
          onClick={handleInstallApk}
          style={{
            background: 'transparent',
            border: 0,
            color: 'var(--blue)',
          }}
        >
          <Smartphone size={18} />
          Install APK
        </button>
        <button type="button" onClick={() => setIsAboutOpen(true)} style={{ background: 'transparent', border: 0 }}>
          <Info />
          About us
        </button>
      </nav>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="drawer-backdrop" onClick={() => setIsMobileMenuOpen(false)}>
          <aside
            className="drawer"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '280px',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div
              className="drawer-head"
              style={{
                marginBottom: '8px',
                paddingBottom: '10px',
                borderBottom: '1px solid var(--line)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '11px', letterSpacing: '1.5px', fontWeight: 800, color: 'var(--muted)' }}>
                MENU
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
                className="icon-button"
                style={{ width: '32px', height: '32px' }}
              >
                <X size={16} />
              </button>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <button
                type="button"
                onClick={handleOpenNewArrivals}
                style={{
                  border: 0,
                  borderBottom: '1px solid var(--line)',
                  justifyContent: 'space-between',
                  padding: '14px 4px',
                  font: '700 18px Barlow Condensed',
                  background: 'transparent',
                  color: 'var(--ink)',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Sparkles size={18} color="var(--blue)" /> New arrivals
                </span>
                <ArrowRight size={15} color="var(--muted)" />
              </button>

              <a
                href="#categories"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  document.querySelector('#categories')?.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                  border: 0,
                  borderBottom: '1px solid var(--line)',
                  justifyContent: 'space-between',
                  padding: '14px 4px',
                  font: '700 18px Barlow Condensed',
                  background: 'transparent',
                  color: 'var(--ink)',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  width: '100%',
                  textDecoration: 'none',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Minus size={18} color="var(--blue)" /> Categories
                </span>
                <ArrowRight size={15} color="var(--muted)" />
              </a>

              <button
                type="button"
                onClick={handleInstallApk}
                style={{
                  border: 0,
                  borderBottom: '1px solid var(--line)',
                  justifyContent: 'space-between',
                  padding: '14px 4px',
                  font: '700 18px Barlow Condensed',
                  background: 'transparent',
                  color: 'var(--blue)',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Smartphone size={18} color="var(--blue)" /> Install APK
                </span>
                <span
                  style={{
                    background: '#e6f7ee',
                    color: '#16824f',
                    fontSize: '9px',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    letterSpacing: '0.5px',
                  }}
                >
                  ANDROID
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsAboutOpen(true);
                }}
                style={{
                  border: 0,
                  justifyContent: 'space-between',
                  padding: '14px 4px',
                  font: '700 18px Barlow Condensed',
                  background: 'transparent',
                  color: 'var(--ink)',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Info size={18} color="var(--blue)" /> About us
                </span>
                <ArrowRight size={15} color="var(--muted)" />
              </button>
            </nav>
          </aside>
        </div>
      )}

      {/* About Us Modal */}
      {isAboutOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 110,
            background: 'rgba(0, 0, 0, 0.72)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setIsAboutOpen(false)}
        >
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              padding: '26px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45)',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="brand-bolt" style={{ width: '28px', height: '28px' }}>
                  <Zap fill="currentColor" size={16} />
                </span>
                <span style={{ font: '800 22px Barlow Condensed', letterSpacing: '1px' }}>ABOUT BEYONDTECH</span>
              </div>
              <button
                onClick={() => setIsAboutOpen(false)}
                className="icon-button"
                aria-label="Close dialog"
                style={{ width: '34px', height: '34px' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ color: 'var(--ink)', fontSize: '13px', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: '13px' }}>
                <strong style={{ color: 'var(--ink)' }}>BeyondTech</strong> is your verified tech partner in Uganda, supplying 100% genuine consumer electronics, flagship smartphones, computing systems, high-fidelity audio, and modern appliances.
              </p>

              <div style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '10px', padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '13px', marginBottom: '4px' }}>
                  <MapPin size={16} color="var(--blue)" />
                  <span>Physical Store Location</span>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)' }}>
                  Aponye Mall, Central Kampala, Uganda.<br />
                  Walk-in shopping, instant device demo & pickup available daily.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '8px', padding: '12px' }}>
                  <strong style={{ display: 'block', fontSize: '12px', marginBottom: '3px', color: 'var(--ink)' }}>🛡️ Official Warranty</strong>
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>12-month manufacturer guarantee on hardware.</span>
                </div>
                <div style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '8px', padding: '12px' }}>
                  <strong style={{ display: 'block', fontSize: '12px', marginBottom: '3px', color: 'var(--ink)' }}>🚚 Fast Delivery</strong>
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Express Kampala courier & countrywide parcel dispatch.</span>
                </div>
              </div>

              <div style={{ marginTop: '6px' }}>
                <a
                  href="https://wa.me/256753078814"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whatsapp-btn"
                  style={{
                    width: '100%',
                    height: '42px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '12px',
                    fontWeight: 800,
                  }}
                >
                  <WhatsAppIcon size={18} />
                  <span>CONTACT US ON WHATSAPP (+256 753 078 814)</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Install APK / App Modal */}
      {isInstallModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 110,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setIsInstallModalOpen(false)}
        >
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              padding: '26px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45)',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #075fe4, #043888)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    boxShadow: '0 4px 12px rgba(7, 95, 228, 0.3)',
                  }}
                >
                  <Zap fill="currentColor" size={24} />
                </div>
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--blue)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    Official Android Release
                  </span>
                  <h2 style={{ margin: '2px 0 0', font: '800 24px Barlow Condensed', textTransform: 'uppercase' }}>
                    Install BeyondTech App
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setIsInstallModalOpen(false)}
                className="icon-button"
                style={{ width: '32px', height: '32px' }}
                aria-label="Close install modal"
              >
                <X size={16} />
              </button>
            </div>

            <p style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--muted)', margin: '0 0 16px' }}>
              Get faster browsing, instant stock alerts, and 1-tap WhatsApp ordering with the BeyondTech Android app.
            </p>

            {/* Feature highlights */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px',
                marginBottom: '20px',
                background: 'rgba(7, 95, 228, 0.04)',
                border: '1px solid var(--line)',
                borderRadius: '10px',
                padding: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600 }}>
                <CheckCircle2 size={15} color="#16824f" /> Offline Storefront
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600 }}>
                <CheckCircle2 size={15} color="#16824f" /> 1-Tap Orders
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600 }}>
                <CheckCircle2 size={15} color="#16824f" /> Instant Notifications
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600 }}>
                <CheckCircle2 size={15} color="#16824f" /> Safe & Light (~2MB)
              </div>
            </div>

            {/* Direct Download & Install Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <a
                href="/beyondtech.apk"
                download="BeyondTech-Store.apk"
                onClick={() => showToast('Downloading BeyondTech APK...')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'var(--blue)',
                  color: '#fff',
                  padding: '14px 20px',
                  borderRadius: '8px',
                  font: '800 15px Barlow Condensed',
                  letterSpacing: '0.5px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(7, 95, 228, 0.35)',
                  textAlign: 'center',
                }}
              >
                <Download size={18} />
                DOWNLOAD ANDROID APK (.apk)
              </a>

              {deferredPrompt && (
                <button
                  type="button"
                  onClick={() => {
                    deferredPrompt.prompt();
                    deferredPrompt.userChoice.then((res: { outcome: string }) => {
                      if (res.outcome === 'accepted') {
                        showToast('BeyondTech App is installing!');
                        setDeferredPrompt(null);
                        setIsInstallModalOpen(false);
                      }
                    });
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: '#16824f',
                    color: '#fff',
                    padding: '13px 20px',
                    borderRadius: '8px',
                    border: 0,
                    font: '800 15px Barlow Condensed',
                    letterSpacing: '0.5px',
                    cursor: 'pointer',
                  }}
                >
                  <Smartphone size={18} />
                  INSTALL TO HOME SCREEN (PWA)
                </button>
              )}
            </div>

            {/* Installation Instructions */}
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: '16px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                How to install on Android:
              </span>
              <ol style={{ margin: '8px 0 0', paddingLeft: '18px', fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>
                <li>Tap <strong>DOWNLOAD ANDROID APK</strong> above.</li>
                <li>When the download finishes, tap <strong>Open</strong> from your notification bar or Downloads folder.</li>
                <li>Tap <strong>Install</strong>. If prompted, allow installations from your browser.</li>
                <li>Launch BeyondTech directly from your home screen or app drawer!</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast">
          <span>✓</span>
          {toastMessage}
        </div>
      )}
    </div>
  );
};
