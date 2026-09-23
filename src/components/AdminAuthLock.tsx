import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ArrowRight, ArrowLeft, ShieldAlert, Zap, CheckCircle2 } from 'lucide-react';

interface AdminAuthLockProps {
  onAuthenticated: () => void;
  onBackToStore: () => void;
}

const ADMIN_PASSWORD = 'Maximum@256';

export const AdminAuthLock: React.FC<AdminAuthLockProps> = ({
  onAuthenticated,
  onBackToStore,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setError(false);
      setErrorMessage('');
      setIsSuccess(true);
      setTimeout(() => {
        onAuthenticated();
      }, 500);
    } else {
      setError(true);
      setErrorMessage('Access Denied: Incorrect administrator password');
      setPassword('');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 50% 30%, #0d1726 0%, #060a10 100%)',
        color: '#f4f6f7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Manrope, sans-serif',
      }}
    >
      {/* Background ambient accents */}
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(7, 95, 228, 0.15) 0%, transparent 70%)',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'rgba(18, 26, 36, 0.88)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          borderRadius: '18px',
          padding: '40px 32px',
          boxShadow: '0 30px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(7, 95, 228, 0.2)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: error
                ? 'rgba(239, 68, 68, 0.12)'
                : isSuccess
                ? 'rgba(34, 197, 94, 0.15)'
                : 'linear-gradient(135deg, rgba(7, 95, 228, 0.2) 0%, rgba(7, 95, 228, 0.05) 100%)',
              border: `1px solid ${
                error
                  ? 'rgba(239, 68, 68, 0.4)'
                  : isSuccess
                  ? 'rgba(34, 197, 94, 0.5)'
                  : 'rgba(7, 95, 228, 0.4)'
              }`,
              marginBottom: '18px',
              transition: 'all 0.3s ease',
            }}
          >
            {isSuccess ? (
              <CheckCircle2 size={30} color="#22c55e" />
            ) : error ? (
              <ShieldAlert size={30} color="#ef4444" />
            ) : (
              <Lock size={28} color="#55a2ff" />
            )}
          </div>

          <div
            style={{
              fontSize: '10px',
              letterSpacing: '2.5px',
              fontWeight: 800,
              color: '#55a2ff',
              textTransform: 'uppercase',
              marginBottom: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Zap size={13} fill="currentColor" /> SECURITY GATEWAY
          </div>

          <h1
            style={{
              font: '800 36px "Barlow Condensed", sans-serif',
              margin: '0 0 10px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: '#ffffff',
            }}
          >
            Control Room Access
          </h1>

          <p
            style={{
              fontSize: '13px',
              color: '#9ca9b8',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Enter the authorized administrator password to manage BeyondTech inventory, products, and catalog data.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="admin-password-input"
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: '#9ca9b8',
                marginBottom: '8px',
              }}
            >
              Admin Password
            </label>

            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <input
                id="admin-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                autoFocus
                placeholder="Enter password"
                style={{
                  width: '100%',
                  background: 'rgba(8, 14, 22, 0.95)',
                  border: error
                    ? '1.5px solid #ef4444'
                    : '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  padding: '14px 44px 14px 16px',
                  fontSize: '15px',
                  color: '#ffffff',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxShadow: error ? '0 0 12px rgba(239, 68, 68, 0.25)' : 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'transparent',
                  border: 0,
                  color: '#68727e',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
              <div
                style={{
                  color: '#ef4444',
                  fontSize: '12px',
                  marginTop: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 600,
                  animation: 'fadeIn 0.2s ease',
                }}
              >
                <span>✕</span> {errorMessage}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!password || isSuccess}
            style={{
              width: '100%',
              background: isSuccess ? '#16a34a' : '#075fe4',
              color: '#ffffff',
              border: 0,
              padding: '14px',
              borderRadius: '10px',
              font: '800 15px "Barlow Condensed", sans-serif',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              cursor: !password || isSuccess ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'background 0.2s, transform 0.1s',
              opacity: !password ? 0.6 : 1,
            }}
          >
            {isSuccess ? (
              <>
                ACCESS GRANTED <CheckCircle2 size={18} />
              </>
            ) : (
              <>
                AUTHENTICATE & UNLOCK <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div
          style={{
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <button
            type="button"
            onClick={onBackToStore}
            style={{
              background: 'transparent',
              border: 0,
              color: '#9ca9b8',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '6px',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca9b8')}
          >
            <ArrowLeft size={16} /> Return to Storefront
          </button>
        </div>
      </div>
    </div>
  );
};
