import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Star, ShieldCheck, Truck, RefreshCw, MapPin, Video, Image as ImageIcon } from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../data/products';
import { WhatsAppIcon, getWhatsAppUrl } from './Storefront';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

const getEmbedUrl = (url: string) => {
  if (!url) return '';
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1`;
  }
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  }
  return url;
};

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState<0 | 1>(0);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    setActiveImageIndex(0);
    setShowVideo(false);
  }, [product?.id]);

  if (!product) return null;

  const currentImg = activeImageIndex === 1 && product.secondaryImage ? product.secondaryImage : product.image;
  const embedUrl = product.videoUrl ? getEmbedUrl(product.videoUrl) : '';
  const isEmbedVideo = embedUrl.includes('youtube') || embedUrl.includes('vimeo');

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="product-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ borderRadius: '16px', maxWidth: '700px' }}
      >
        <div className="modal-head" style={{ marginBottom: '16px' }}>
          <div>
            <span style={{ letterSpacing: '2px', color: 'var(--blue)', fontSize: '9px', fontWeight: 800 }}>
              DEVICE SPECIFICATION
            </span>
            <h2 style={{ margin: '4px 0 0', font: '800 32px Barlow Condensed' }}>{product.name}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '22px' }}>
          <div>
            {/* Media Container */}
            <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', background: '#0a1017', height: '280px', border: '1px solid var(--line)' }}>
              {showVideo && product.videoUrl ? (
                isEmbedVideo ? (
                  <iframe
                    src={embedUrl}
                    title={`${product.name} video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ width: '100%', height: '100%', border: 0 }}
                  />
                ) : (
                  <video
                    src={product.videoUrl}
                    controls
                    autoPlay
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                )
              ) : (
                <>
                  <img
                    src={currentImg}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  {product.badge && (
                    <span className={`badge badge-${product.badge.length % 3}`} style={{ top: '12px', left: '12px' }}>
                      {product.badge}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Media Switcher: Photo 1, 2nd Photo, Video */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  setShowVideo(false);
                  setActiveImageIndex(0);
                }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: !showVideo && activeImageIndex === 0 ? '2px solid var(--blue)' : '1px solid var(--line)',
                  background: !showVideo && activeImageIndex === 0 ? 'var(--surface)' : 'var(--bg)',
                  color: !showVideo && activeImageIndex === 0 ? 'var(--blue)' : 'var(--muted)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <ImageIcon size={14} /> Photo 1
              </button>

              {product.secondaryImage && (
                <button
                  type="button"
                  onClick={() => {
                    setShowVideo(false);
                    setActiveImageIndex(1);
                  }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    border: !showVideo && activeImageIndex === 1 ? '2px solid var(--blue)' : '1px solid var(--line)',
                    background: !showVideo && activeImageIndex === 1 ? 'var(--surface)' : 'var(--bg)',
                    color: !showVideo && activeImageIndex === 1 ? 'var(--blue)' : 'var(--muted)',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <ImageIcon size={14} /> Photo 2
                </button>
              )}

              {product.videoUrl && (
                <button
                  type="button"
                  onClick={() => setShowVideo(true)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    border: showVideo ? '2px solid #16824f' : '1px solid var(--line)',
                    background: showVideo ? '#e6f7ee' : 'var(--bg)',
                    color: showVideo ? '#16824f' : 'var(--muted)',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Video size={14} /> Video Demo
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--blue)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '1.5px' }}>
                {product.category}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0 12px' }}>
                <span style={{ color: '#dba611', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700 }}>
                  <Star size={14} fill="#dba611" /> {product.rating}
                </span>
                <span style={{ color: 'var(--muted)', fontSize: '12px' }}>
                  ({product.reviews.toLocaleString()} reviews)
                </span>
              </div>
              <p style={{ color: 'var(--muted)', fontSize: '13px', lineHeight: 1.6, margin: '0 0 16px' }}>
                {product.description}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: 'var(--bg)', borderRadius: '8px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--ink)' }}>
                  <MapPin size={14} color="var(--blue)" />
                  <span>Physical Store Pickup: <strong>Aponye Mall, Kampala</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--ink)' }}>
                  <Truck size={14} color="var(--blue)" />
                  <span>Next-Day Kampala & Countrywide Dispatch</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--ink)' }}>
                  <ShieldCheck size={14} color="var(--blue)" />
                  <span>12-Month Official Warranty Included</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--ink)' }}>
                  <RefreshCw size={14} color="var(--blue)" />
                  <span>7-Day Return / Exchange Guarantee</span>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--line)', paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
              <div>
                <small style={{ color: 'var(--muted)', fontSize: '10px', display: 'block', textTransform: 'uppercase' }}>
                  Stock: {product.inventory > 0 ? `${product.inventory} units available` : 'Out of stock'}
                </small>
                <strong style={{ font: '800 28px Barlow Condensed', color: 'var(--ink)' }}>
                  {formatCurrency(product.price)}
                </strong>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <a
                  href={getWhatsAppUrl(product)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whatsapp-btn whatsapp-icon-btn"
                  title={`Order ${product.name} on WhatsApp`}
                  aria-label={`Order ${product.name} on WhatsApp`}
                  style={{
                    width: '42px',
                    height: '42px',
                    padding: 0,
                    borderRadius: '6px',
                  }}
                >
                  <WhatsAppIcon size={22} />
                </a>
                <button
                  onClick={() => {
                    onAddToCart(product);
                    onClose();
                  }}
                  disabled={product.inventory <= 0}
                  style={{
                    background: 'var(--blue)',
                    color: '#fff',
                    border: 0,
                    borderRadius: '6px',
                    height: '42px',
                    padding: '0 16px',
                    font: '800 13px Barlow Condensed',
                    letterSpacing: '1px',
                    cursor: product.inventory > 0 ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: product.inventory > 0 ? 1 : 0.6,
                  }}
                >
                  <ShoppingBag size={16} /> ADD TO BAG
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
