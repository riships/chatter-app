import React, { useState } from 'react';
import { AvatarPicker } from './AvatarPicker';
import { MessageSquare, ArrowRight, User, Lock, AlertCircle } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (username: string, password: string, avatarUrl: string) => Promise<boolean>;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('images/user1.jpg');
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Username and password are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const success = await onLogin(username.trim(), password.trim(), avatarUrl);
    setIsSubmitting(false);

    if (!success) {
      setErrorMsg(`Authentication failed. Incorrect password for username '${username.trim()}'.`);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        className="glass-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth: 440,
          padding: '40px 32px',
          borderRadius: 28,
          position: 'relative',
          zIndex: 10,
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Title Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              marginBottom: 16,
              boxShadow: '0 8px 20px rgba(170, 77, 188, 0.4)',
            }}
          >
            <MessageSquare style={{ color: '#fff', width: 32, height: 32 }} />
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.8rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              marginBottom: 6,
            }}
          >
            Chatter Security
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Enter your credentials to protect your user account
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 12,
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#ef4444',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 20,
            }}
          >
            <AlertCircle style={{ width: 18, height: 18, flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Avatar Picker */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Profile Avatar
            </span>
            <AvatarPicker
              selectedAvatar={avatarUrl}
              onSelectAvatar={setAvatarUrl}
              isOpen={isAvatarPickerOpen}
              onToggle={() => setIsAvatarPickerOpen(!isAvatarPickerOpen)}
            />
          </div>

          {/* Username Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, color: '#f8fafc' }}>
              Username
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 16px',
                borderRadius: 14,
                border: '1px solid var(--border-color)',
                background: 'rgba(255, 255, 255, 0.04)',
              }}
            >
              <User style={{ color: 'var(--accent)', width: 18, height: 18 }} />
              <input
                type="text"
                placeholder="Enter username (e.g. Alice)..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  outline: 'none',
                  fontSize: '0.95rem',
                  width: '100%',
                }}
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, color: '#f8fafc' }}>
              Password
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 16px',
                borderRadius: 14,
                border: '1px solid var(--border-color)',
                background: 'rgba(255, 255, 255, 0.04)',
              }}
            >
              <Lock style={{ color: 'var(--accent)', width: 18, height: 18 }} />
              <input
                type="password"
                placeholder="Enter your account password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  outline: 'none',
                  fontSize: '0.95rem',
                  width: '100%',
                }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !username.trim() || !password.trim()}
            style={{
              marginTop: 10,
              padding: '14px 20px',
              borderRadius: 14,
              border: 'none',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              color: '#fff',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: isSubmitting ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 8px 20px rgba(170, 77, 188, 0.35)',
              opacity: !username.trim() || !password.trim() || isSubmitting ? 0.6 : 1,
              transition: 'transform 0.2s ease, opacity 0.2s ease',
            }}
          >
            <span>{isSubmitting ? 'Authenticating...' : 'Log In / Register Account'}</span>
            <ArrowRight style={{ width: 18, height: 18 }} />
          </button>
        </form>
      </div>
    </div>
  );
};
