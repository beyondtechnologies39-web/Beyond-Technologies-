import React, { useState, useMemo, useRef } from 'react';
import {
  ArrowLeft,
  Box,
  Camera,
  CheckCircle2,
  Image as ImageIcon,
  LayoutDashboard,
  Link as LinkIcon,
  Lock,
  PackagePlus,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  Sparkles,
  Trash2,
  TrendingUp,
  Upload,
  Video,
  X,
  Zap,
} from 'lucide-react';
import { Product } from '../types';
import { CATEGORIES, formatCurrency } from '../data/products';

const GALLERY_PRESETS = [
  { label: 'Smart 4K TV', url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=900&q=80' },
  { label: 'Studio Headphones', url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80' },
  { label: 'Smartphone Pro', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80' },
  { label: 'Laptop Pro', url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80' },
  { label: 'Smart Watch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80' },
  { label: 'Wireless Speaker', url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=900&q=80' },
  { label: 'Fast Charger & Cord', url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=900&q=80' },
  { label: 'Mechanical Keyboard', url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80' },
];

const optimizeGalleryImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read photo from device gallery'));
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to parse photo'));
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const maxDim = 1200;
          let w = img.width;
          let h = img.height;

          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }

          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(dataUrl);
            return;
          }
          ctx.drawImage(img, 0, 0, w, h);
          const optimized = canvas.toDataURL('image/jpeg', 0.84);
          resolve(optimized);
        } catch {
          resolve(dataUrl);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
};

interface AdminDashboardProps {
  products: Product[];
  onNavigateStore: () => void;
  onSaveProduct: (product: Partial<Product> & { id?: number }) => Promise<void>;
  onDeleteProduct: (productId: number) => Promise<void>;
  onLockPanel?: () => void;
}

const EMPTY_FORM: Partial<Product> = {
  name: '',
  category: 'TV Appliances',
  description: '',
  price: '',
  badge: 'NEW',
  image: '',
  secondaryImage: '',
  videoUrl: '',
  inventory: 10,
  featured: false,
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  onNavigateStore,
  onSaveProduct,
  onDeleteProduct,
  onLockPanel,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>(EMPTY_FORM);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [adminMessage, setAdminMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'catalog'>('overview');
  const [isOptimizingPrimary, setIsOptimizingPrimary] = useState(false);
  const [isOptimizingSecondary, setIsOptimizingSecondary] = useState(false);
  const [showPresetGalleryFor, setShowPresetGalleryFor] = useState<'image' | 'secondaryImage' | null>(null);
  const [showUrlInputFor, setShowUrlInputFor] = useState<{ image: boolean; secondaryImage: boolean }>({
    image: false,
    secondaryImage: false,
  });

  const showMessage = (msg: string) => {
    setAdminMessage(msg);
  };

  const handleFileUpload = async (field: 'image' | 'secondaryImage', file: File) => {
    if (!file) return;
    if (field === 'image') setIsOptimizingPrimary(true);
    else setIsOptimizingSecondary(true);

    try {
      const optimized = await optimizeGalleryImage(file);
      setFormData((prev) => ({ ...prev, [field]: optimized }));
      showMessage('✓ Photo from device gallery loaded and optimized for fast display.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not process photo from gallery.';
      showMessage(message);
    } finally {
      if (field === 'image') setIsOptimizingPrimary(false);
      else setIsOptimizingSecondary(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      `${p.name} ${p.category} ${p.id}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const totalStock = useMemo(() => {
    return products.reduce((acc, p) => acc + (Number(p.inventory) || 0), 0);
  }, [products]);

  const featuredCount = useMemo(() => {
    return products.filter((p) => p.featured).length;
  }, [products]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      ...EMPTY_FORM,
      image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=900&q=86',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData(EMPTY_FORM);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveProduct({
        ...formData,
        id: editingProduct?.id,
        price: String(formData.price || '0'),
        inventory: Number(formData.inventory) || 0,
        rating: editingProduct?.rating || '4.8',
        reviews: editingProduct?.reviews || 120,
        secondaryImage: formData.secondaryImage || '',
        videoUrl: formData.videoUrl || '',
      });
      showMessage(
        editingProduct
          ? 'Product updated on the storefront.'
          : 'Product published to the storefront.'
      );
      handleCloseModal();
    } catch {
      showMessage('Could not save this product. Check the required fields.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Remove this product from BeyondTech?')) {
      try {
        await onDeleteProduct(id);
        showMessage('Product removed from the storefront.');
      } catch {
        showMessage('Failed to delete product.');
      }
    }
  };

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <button
          onClick={onNavigateStore}
          className="admin-logo"
          title="Back to storefront"
          style={{ cursor: 'pointer', border: 0 }}
        >
          <Zap fill="currentColor" />
          BT
        </button>

        <nav>
          <button
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
            title="Overview"
          >
            <LayoutDashboard />
            <span>Overview</span>
          </button>
          <button
            className={activeTab === 'catalog' ? 'active' : ''}
            onClick={() => setActiveTab('catalog')}
            title="Catalog"
          >
            <Box />
            <span>Catalog</span>
          </button>
          <button onClick={handleOpenAdd} title="Add product">
            <PackagePlus />
            <span>Add product</span>
          </button>
        </nav>

        {onLockPanel && (
          <button
            onClick={onLockPanel}
            title="Lock Control Room"
            style={{
              marginTop: '12px',
              border: 0,
              background: 'transparent',
              color: '#ef4444',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Lock size={18} />
            <span>Lock</span>
          </button>
        )}

        <button
          onClick={onNavigateStore}
          className="back-store"
          title="Storefront"
          style={{ border: 0, cursor: 'pointer' }}
        >
          <ArrowLeft />
          <span>Storefront</span>
        </button>
      </aside>

      {/* Main Admin Section */}
      <main className="admin-main">
        <header className="admin-header">
          <div>
            <span>BEYONDTECH / CONTROL ROOM</span>
            <h1>Catalog dashboard</h1>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {onLockPanel && (
              <button
                onClick={onLockPanel}
                style={{
                  color: '#f4f6f7',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 18px',
                  fontSize: '11px',
                  fontWeight: 800,
                  display: 'flex',
                  cursor: 'pointer',
                  letterSpacing: '1px',
                }}
                title="Lock admin session"
              >
                <Lock size={15} color="#ef4444" /> LOCK PANEL
              </button>
            )}
            <button className="new-product" onClick={handleOpenAdd}>
              <Plus /> New product
            </button>
          </div>
        </header>

        {adminMessage && (
          <button
            className="admin-message"
            onClick={() => setAdminMessage('')}
            aria-label="Dismiss message"
          >
            <span>{adminMessage}</span>
            <X size={15} />
          </button>
        )}

        {/* Stats Grid */}
        <section className="stats-grid">
          <div>
            <span>LIVE PRODUCTS</span>
            <strong>{products.length.toString().padStart(2, '0')}</strong>
            <Box />
          </div>
          <div>
            <span>UNITS IN STOCK</span>
            <strong>{totalStock}</strong>
            <ShoppingBag />
          </div>
          <div>
            <span>FEATURED DROPS</span>
            <strong>{featuredCount.toString().padStart(2, '0')}</strong>
            <TrendingUp />
          </div>
        </section>

        {/* Catalog Table Panel */}
        <section className="catalog-panel">
          <div className="catalog-toolbar">
            <div>
              <h2>Live inventory</h2>
              <p>Every saved change appears on the customer storefront.</p>
            </div>
            <label>
              <Search />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search inventory"
              />
            </label>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="table-loading">No products found in inventory.</div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="product-cell">
                          <img
                            src={p.image}
                            alt=""
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=150&q=80';
                            }}
                          />
                          <div>
                            <strong>{p.name}</strong>
                            <small style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span>#{p.id.toString().padStart(4, '0')}</span>
                              {p.secondaryImage && (
                                <span style={{ color: '#075fe4', fontWeight: 700, fontSize: '9px', background: '#e0edff', padding: '1px 5px', borderRadius: '4px' }}>
                                  2 PHOTOS
                                </span>
                              )}
                              {p.videoUrl && (
                                <span style={{ color: '#16824f', fontWeight: 700, fontSize: '9px', background: '#e6f7ee', padding: '1px 5px', borderRadius: '4px' }}>
                                  VIDEO
                                </span>
                              )}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>{p.category}</td>
                      <td>{formatCurrency(p.price)}</td>
                      <td>{p.inventory}</td>
                      <td>
                        <span className={p.inventory > 0 ? 'status-live' : 'status-out'}>
                          {p.inventory > 0 ? 'Live' : 'Out'}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            aria-label="Edit product"
                            title="Edit"
                          >
                            <Pencil />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            aria-label="Delete product"
                            title="Delete"
                          >
                            <Trash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Product Create / Edit Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <form
            className="product-modal"
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <span>CATALOG EDITOR</span>
                <h2>{editingProduct ? 'Edit product' : 'New product'}</h2>
              </div>
              <button type="button" onClick={handleCloseModal} aria-label="Close modal">
                <X />
              </button>
            </div>

            <div className="form-grid">
              <label>
                Product name
                <input
                  required
                  value={String(formData.name || '')}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Arc Soundbar S3"
                />
              </label>

              <label>
                Category
                <select
                  value={String(formData.category || 'TV Appliances')}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="wide">
                Description
                <textarea
                  value={String(formData.description || '')}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short product overview and highlights"
                />
              </label>

              <label>
                Price (UGX)
                <input
                  required
                  type="number"
                  min="0"
                  step="1"
                  value={String(formData.price || '')}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="e.g. 189"
                />
              </label>

              <label>
                Inventory
                <input
                  type="number"
                  min="0"
                  value={String(formData.inventory ?? 0)}
                  onChange={(e) => setFormData({ ...formData, inventory: Number(e.target.value) })}
                />
              </label>

              <label>
                Badge
                <input
                  value={String(formData.badge || '')}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="e.g. BESTSELLER, 20% OFF, NEW"
                />
              </label>

              {/* Primary Photo Section */}
              <div
                className="wide"
                style={{
                  border: '1px solid #d7dbdc',
                  borderRadius: '10px',
                  padding: '16px',
                  background: '#fbfcfd',
                  marginTop: '4px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginBottom: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ImageIcon size={15} color="#075fe4" />
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.6px',
                        color: '#111820',
                      }}
                    >
                      Primary Photo <span style={{ color: '#e02424' }}>*</span>
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() =>
                        setShowPresetGalleryFor((prev) => (prev === 'image' ? null : 'image'))
                      }
                      style={{
                        background: showPresetGalleryFor === 'image' ? 'rgba(7, 95, 228, 0.15)' : '#f0f3f6',
                        border: '1px solid #d8dcda',
                        color: showPresetGalleryFor === 'image' ? '#075fe4' : '#4b5563',
                        padding: '4px 9px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Sparkles size={12} /> Tech Presets
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setShowUrlInputFor((prev) => ({ ...prev, image: !prev.image }))
                      }
                      style={{
                        background: showUrlInputFor.image ? 'rgba(7, 95, 228, 0.15)' : '#f0f3f6',
                        border: '1px solid #d8dcda',
                        color: showUrlInputFor.image ? '#075fe4' : '#4b5563',
                        padding: '4px 9px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <LinkIcon size={12} /> Paste Link
                    </button>
                  </div>
                </div>

                {/* Gallery Dropzone / Picker */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleFileUpload('image', file);
                  }}
                  style={{
                    border: '2px dashed #075fe4',
                    borderRadius: '8px',
                    padding: '16px',
                    background: '#f4f8fe',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    textAlign: 'center',
                  }}
                >
                  {isOptimizingPrimary ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#075fe4', fontWeight: 700, fontSize: '12px' }}>
                      <RefreshCw className="animate-spin" size={16} />
                      <span>Optimizing photo from gallery for high-speed storefront display...</span>
                    </div>
                  ) : formData.image ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={formData.image}
                          alt="Primary photo preview"
                          style={{
                            width: '64px',
                            height: '64px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            border: '2px solid #075fe4',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          }}
                        />
                        <div style={{ textAlign: 'left' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#16824f', fontWeight: 800, fontSize: '12px' }}>
                            <CheckCircle2 size={14} /> Photo active & ready
                          </span>
                          <span style={{ fontSize: '10px', color: '#6b7280', display: 'block', marginTop: '2px' }}>
                            Optimized for fast mobile loading
                          </span>
                        </div>
                      </div>

                      <label
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#075fe4',
                          color: '#fff',
                          padding: '8px 14px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: 800,
                          margin: 0,
                          boxShadow: '0 2px 6px rgba(7, 95, 228, 0.3)',
                        }}
                      >
                        <ImageIcon size={14} /> Change from Gallery
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload('image', file);
                          }}
                        />
                      </label>
                    </div>
                  ) : (
                    <>
                      <label
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: '#075fe4',
                          color: '#fff',
                          padding: '10px 18px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 800,
                          margin: 0,
                          boxShadow: '0 3px 10px rgba(7, 95, 228, 0.35)',
                        }}
                      >
                        <ImageIcon size={16} /> UPLOAD FROM GALLERY / PHOTOS
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload('image', file);
                          }}
                        />
                      </label>
                      <span style={{ fontSize: '11px', color: '#4b5563' }}>
                        Tap button to browse your photo library or drag and drop image here
                      </span>
                    </>
                  )}
                </div>

                {/* Optional URL input for Primary */}
                {showUrlInputFor.image && (
                  <div style={{ marginTop: '10px' }}>
                    <input
                      required
                      type="url"
                      value={String(formData.image || '')}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="Or enter image URL: https://..."
                      style={{ width: '100%', fontSize: '12px' }}
                    />
                  </div>
                )}

                {/* Stock Presets Drawer for Primary */}
                {showPresetGalleryFor === 'image' && (
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '12px',
                      background: '#fff',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#075fe4', display: 'block', marginBottom: '8px' }}>
                      Select a BeyondTech Hardware Preset:
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '8px' }}>
                      {GALLERY_PRESETS.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, image: preset.url });
                            setShowPresetGalleryFor(null);
                            showMessage(`✓ Selected preset: ${preset.label}`);
                          }}
                          style={{
                            border: formData.image === preset.url ? '2px solid #075fe4' : '1px solid #e5e7eb',
                            borderRadius: '6px',
                            padding: '4px',
                            background: '#fff',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <img
                            src={preset.url}
                            alt={preset.label}
                            style={{ width: '100%', height: '54px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                          <span style={{ fontSize: '9px', fontWeight: 700, color: '#111820', textAlign: 'center' }}>
                            {preset.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 2nd Photo Section (Optional) */}
              <div
                className="wide"
                style={{
                  border: '1px solid #d7dbdc',
                  borderRadius: '10px',
                  padding: '16px',
                  background: '#fbfcfd',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginBottom: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ImageIcon size={15} color="#13263e" />
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.6px',
                        color: '#111820',
                      }}
                    >
                      2nd Photo (Optional)
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {formData.secondaryImage && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, secondaryImage: '' });
                          showMessage('2nd photo removed.');
                        }}
                        style={{
                          background: 'transparent',
                          border: 0,
                          color: '#e02424',
                          fontSize: '11px',
                          cursor: 'pointer',
                          fontWeight: 700,
                        }}
                      >
                        Remove 2nd photo
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setShowPresetGalleryFor((prev) =>
                          prev === 'secondaryImage' ? null : 'secondaryImage'
                        )
                      }
                      style={{
                        background:
                          showPresetGalleryFor === 'secondaryImage'
                            ? 'rgba(7, 95, 228, 0.15)'
                            : '#f0f3f6',
                        border: '1px solid #d8dcda',
                        color: showPresetGalleryFor === 'secondaryImage' ? '#075fe4' : '#4b5563',
                        padding: '4px 9px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Sparkles size={12} /> Tech Presets
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setShowUrlInputFor((prev) => ({
                          ...prev,
                          secondaryImage: !prev.secondaryImage,
                        }))
                      }
                      style={{
                        background: showUrlInputFor.secondaryImage
                          ? 'rgba(7, 95, 228, 0.15)'
                          : '#f0f3f6',
                        border: '1px solid #d8dcda',
                        color: showUrlInputFor.secondaryImage ? '#075fe4' : '#4b5563',
                        padding: '4px 9px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <LinkIcon size={12} /> Paste Link
                    </button>
                  </div>
                </div>

                {/* 2nd Photo Dropzone / Picker */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleFileUpload('secondaryImage', file);
                  }}
                  style={{
                    border: '2px dashed #94a3b8',
                    borderRadius: '8px',
                    padding: '16px',
                    background: '#f8fafc',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    textAlign: 'center',
                  }}
                >
                  {isOptimizingSecondary ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#075fe4', fontWeight: 700, fontSize: '12px' }}>
                      <RefreshCw className="animate-spin" size={16} />
                      <span>Optimizing 2nd photo from gallery...</span>
                    </div>
                  ) : formData.secondaryImage ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={formData.secondaryImage}
                          alt="2nd photo preview"
                          style={{
                            width: '64px',
                            height: '64px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            border: '2px solid #13263e',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          }}
                        />
                        <div style={{ textAlign: 'left' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#16824f', fontWeight: 800, fontSize: '12px' }}>
                            <CheckCircle2 size={14} /> 2nd photo active
                          </span>
                          <span style={{ fontSize: '10px', color: '#6b7280', display: 'block', marginTop: '2px' }}>
                            Displays as secondary view on detail modal
                          </span>
                        </div>
                      </div>

                      <label
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#13263e',
                          color: '#fff',
                          padding: '8px 14px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: 800,
                          margin: 0,
                        }}
                      >
                        <ImageIcon size={14} /> Change 2nd Photo
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload('secondaryImage', file);
                          }}
                        />
                      </label>
                    </div>
                  ) : (
                    <>
                      <label
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: '#13263e',
                          color: '#fff',
                          padding: '10px 18px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 800,
                          margin: 0,
                          boxShadow: '0 3px 10px rgba(19, 38, 62, 0.25)',
                        }}
                      >
                        <ImageIcon size={16} /> CHOOSE 2ND PHOTO FROM GALLERY
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload('secondaryImage', file);
                          }}
                        />
                      </label>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        Optional extra photo for customers to see alternate angles or ports
                      </span>
                    </>
                  )}
                </div>

                {/* Optional URL input for Secondary */}
                {showUrlInputFor.secondaryImage && (
                  <div style={{ marginTop: '10px' }}>
                    <input
                      type="url"
                      value={String(formData.secondaryImage || '')}
                      onChange={(e) =>
                        setFormData({ ...formData, secondaryImage: e.target.value })
                      }
                      placeholder="Or enter 2nd image URL: https://..."
                      style={{ width: '100%', fontSize: '12px' }}
                    />
                  </div>
                )}

                {/* Stock Presets Drawer for Secondary */}
                {showPresetGalleryFor === 'secondaryImage' && (
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '12px',
                      background: '#fff',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#075fe4', display: 'block', marginBottom: '8px' }}>
                      Select a Preset for 2nd Photo:
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '8px' }}>
                      {GALLERY_PRESETS.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, secondaryImage: preset.url });
                            setShowPresetGalleryFor(null);
                            showMessage(`✓ Selected 2nd photo preset: ${preset.label}`);
                          }}
                          style={{
                            border:
                              formData.secondaryImage === preset.url
                                ? '2px solid #075fe4'
                                : '1px solid #e5e7eb',
                            borderRadius: '6px',
                            padding: '4px',
                            background: '#fff',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <img
                            src={preset.url}
                            alt={preset.label}
                            style={{ width: '100%', height: '54px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                          <span style={{ fontSize: '9px', fontWeight: 700, color: '#111820', textAlign: 'center' }}>
                            {preset.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Video Link (Optional) */}
              <div className="wide" style={{ border: '1px solid #d7dbdc', borderRadius: '8px', padding: '14px', background: '#fafafa' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#111820', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <Video size={14} color="#075fe4" /> Product Video Link (Optional)
                </span>
                <input
                  type="url"
                  value={String(formData.videoUrl || '')}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=... or MP4 / Vimeo video URL"
                  style={{ width: '100%' }}
                />
                <span style={{ display: 'block', marginTop: '6px', fontSize: '10px', color: '#737e89' }}>
                  Customers can watch this product unboxing or demo directly on the storefront.
                </span>
              </div>

              <label className="check">
                <input
                  type="checkbox"
                  checked={!!formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  style={{ marginRight: '8px' }}
                />
                Feature on storefront
              </label>
            </div>

            <button className="save-product" disabled={isSaving} type="submit">
              {isSaving
                ? 'Saving...'
                : editingProduct
                ? 'Save changes'
                : 'Publish product'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
