import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, CheckCircle2, ShoppingBag, MapPin } from 'lucide-react';
import { CartItem } from '../types';
import { formatCurrency } from '../data/products';
import { WhatsAppIcon } from './Storefront';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: number, newQty: number) => void;
  onRemoveItem: (productId: number) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [fulfillmentType, setFulfillmentType] = useState<'pickup' | 'delivery'>('pickup');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => {
    return acc + Number(item.product.price) * item.quantity;
  }, 0);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderComplete(true);
    setTimeout(() => {
      onClearCart();
      setOrderComplete(false);
      setIsCheckingOut(false);
      onClose();
    }, 3200);
  };

  const getCartWhatsAppUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://beyondtech.store';
    const itemsList = items
      .map(
        (i, idx) =>
          `${idx + 1}. ${i.product.name} (Qty: ${i.quantity}) - UGX ${(
            Number(i.product.price) * i.quantity
          ).toLocaleString()}\n   Link: ${origin}/?product=${i.product.id}`
      )
      .join('\n');
    const message = `Hello BeyondTech! I would like to order the following items:\n\n${itemsList}\n\n*Total: UGX ${subtotal.toLocaleString()}*\nFulfillment: ${
      fulfillmentType === 'pickup' ? 'Pick up at Aponye Mall Store' : 'Delivery in Kampala/Uganda'
    }\n\nPlease confirm availability. Thank you!`;
    return `https://wa.me/256753078814?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="cart-drawer-backdrop" onClick={onClose}>
      <aside className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cart-head">
          <div>
            <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--blue)', letterSpacing: '2px' }}>
              CHECKOUT DISPATCH
            </span>
            <h2>Your Bag ({items.reduce((sum, i) => sum + i.quantity, 0)})</h2>
          </div>
          <button
            onClick={onClose}
            className="icon-button"
            aria-label="Close cart"
            style={{ width: '38px', height: '38px' }}
          >
            <X size={18} />
          </button>
        </div>

        {orderComplete ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', margin: 'auto' }}>
            <CheckCircle2 size={54} color="#16824f" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ font: '800 32px Barlow Condensed', margin: '0 0 8px' }}>ORDER CONFIRMED</h3>
            <p style={{ color: 'var(--muted)', fontSize: '13px', lineHeight: 1.6, marginBottom: '16px' }}>
              Thank you, {customerName || 'valued customer'}! Your order has been placed.
            </p>
            <div style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '10px', padding: '14px', textAlign: 'left', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '6px' }}>
                <MapPin size={15} color="var(--blue)" />
                <span>Pickup Location: Aponye Mall, Kampala</span>
              </div>
              <p style={{ margin: '0 0 8px', color: 'var(--muted)' }}>
                {fulfillmentType === 'pickup'
                  ? 'Your items will be packed and ready for collection at our Aponye Mall shop.'
                  : `Your package will be dispatched to ${deliveryAddress || 'your address'}.`}
              </p>
              <div style={{ color: '#25d366', fontWeight: 700 }}>
                Support / WhatsApp Hotline: +256 753 078 814
              </div>
            </div>
          </div>
        ) : isCheckingOut ? (
          <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '20px 0' }}>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <h3 style={{ font: '700 20px Barlow Condensed', marginBottom: '16px' }}>Fulfillment & Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Fulfillment Selector */}
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                    Select Fulfillment
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setFulfillmentType('pickup')}
                      style={{
                        padding: '10px',
                        borderRadius: '6px',
                        border: fulfillmentType === 'pickup' ? '1.5px solid var(--blue)' : '1px solid var(--line)',
                        background: fulfillmentType === 'pickup' ? 'rgba(7, 95, 228, 0.08)' : 'var(--bg)',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--ink)' }}>Store Pickup</div>
                      <small style={{ fontSize: '10px', color: 'var(--muted)' }}>Aponye Mall, Kampala</small>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFulfillmentType('delivery')}
                      style={{
                        padding: '10px',
                        borderRadius: '6px',
                        border: fulfillmentType === 'delivery' ? '1.5px solid var(--blue)' : '1px solid var(--line)',
                        background: fulfillmentType === 'delivery' ? 'rgba(7, 95, 228, 0.08)' : 'var(--bg)',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--ink)' }}>Delivery</div>
                      <small style={{ fontSize: '10px', color: 'var(--muted)' }}>Kampala & Upcountry</small>
                    </button>
                  </div>
                </div>

                <label style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
                  Full Name
                  <input
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Samuel Mukasa"
                    style={{
                      width: '100%',
                      marginTop: '6px',
                      padding: '10px 12px',
                      background: 'var(--bg)',
                      border: '1px solid var(--line)',
                      color: 'var(--ink)',
                      borderRadius: '6px',
                    }}
                  />
                </label>
                <label style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
                  Contact Phone (MTN / Airtel)
                  <input
                    required
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+256 700 000 000"
                    style={{
                      width: '100%',
                      marginTop: '6px',
                      padding: '10px 12px',
                      background: 'var(--bg)',
                      border: '1px solid var(--line)',
                      color: 'var(--ink)',
                      borderRadius: '6px',
                    }}
                  />
                </label>
                {fulfillmentType === 'delivery' ? (
                  <label style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
                    Delivery Address / Landmark
                    <textarea
                      required
                      rows={3}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Kampala Road, Plot 14, or neighborhood landmark"
                      style={{
                        width: '100%',
                        marginTop: '6px',
                        padding: '10px 12px',
                        background: 'var(--bg)',
                        border: '1px solid var(--line)',
                        color: 'var(--ink)',
                        borderRadius: '6px',
                      }}
                    />
                  </label>
                ) : (
                  <div style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '6px', padding: '10px 12px', fontSize: '11px', color: 'var(--muted)' }}>
                    📍 Pick up counter located at: <strong>Aponye Mall, Kampala</strong>. We will notify you once prepared!
                  </div>
                )}
                <div style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--muted)' }}>Items Subtotal:</span>
                    <strong>{formatCurrency(subtotal)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: 'var(--muted)' }}>{fulfillmentType === 'pickup' ? 'Store Pickup:' : 'Express Dispatch:'}</span>
                    <span style={{ color: '#16824f', fontWeight: 700 }}>FREE</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--line)', paddingTop: '16px', display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsCheckingOut(false)}
                style={{
                  flex: 1,
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  color: 'var(--ink)',
                  padding: '12px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Back
              </button>
              <button
                type="submit"
                className="checkout-btn"
                style={{ flex: 2 }}
              >
                Complete Order ({formatCurrency(subtotal)})
              </button>
            </div>
          </form>
        ) : items.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--muted)' }}>
            <ShoppingBag size={48} strokeWidth={1.5} style={{ marginBottom: '14px', opacity: 0.6 }} />
            <h3 style={{ font: '700 22px Barlow Condensed', margin: '0 0 6px', color: 'var(--ink)' }}>Your bag is empty</h3>
            <p style={{ fontSize: '13px', maxWidth: '240px', lineHeight: 1.5, margin: '0 0 18px' }}>
              Explore the latest electronics, audio, and personal gear to fill your setup.
            </p>
            <button
              onClick={onClose}
              style={{
                background: 'var(--blue)',
                color: '#fff',
                border: 0,
                padding: '10px 22px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map((item) => (
                <div key={item.product.id} className="cart-item">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Fallback image if broken
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80';
                    }}
                  />
                  <div className="cart-item-details">
                    <span style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 700 }}>
                      {item.product.category}
                    </span>
                    <h4>{item.product.name}</h4>
                    <div className="cart-item-price">{formatCurrency(item.product.price)}</div>
                  </div>
                  <div className="cart-qty-ctrl">
                    <button
                      className="cart-qty-btn"
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={13} />
                    </button>
                    <span style={{ font: '800 13px Barlow Condensed', minWidth: '18px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      className="cart-qty-btn"
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus size={13} />
                    </button>
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      style={{
                        background: 'transparent',
                        border: 0,
                        color: 'var(--muted)',
                        cursor: 'pointer',
                        padding: '4px',
                        marginLeft: '4px',
                      }}
                      aria-label="Remove item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-subtotal">
                <span style={{ color: 'var(--muted)' }}>Subtotal:</span>
                <strong>{formatCurrency(subtotal)}</strong>
              </div>
              <button
                className="checkout-btn"
                onClick={() => setIsCheckingOut(true)}
              >
                Proceed to Checkout ({formatCurrency(subtotal)})
              </button>
              <a
                href={getCartWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-btn"
                style={{
                  width: '100%',
                  marginTop: '8px',
                  height: '42px',
                  borderRadius: '6px',
                  fontSize: '12px',
                }}
              >
                <WhatsAppIcon size={16} /> ORDER FULL CART ON WHATSAPP
              </a>
            </div>
          </>
        )}
      </aside>
    </div>
  );
};
