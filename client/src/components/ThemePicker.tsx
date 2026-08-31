import React, { useState, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';

export type ThemeName = 'cyberpunk' | 'emerald' | 'sunset' | 'ocean';

interface ThemeOption {
  id: ThemeName;
  label: string;
  color: string;
  accent: string;
}

const THEMES: ThemeOption[] = [
  { id: 'cyberpunk', label: 'Cyberpunk Violet', color: '#9333ea', accent: '#c084fc' },
  { id: 'emerald', label: 'Emerald Aurora', color: '#059669', accent: '#34d399' },
  { id: 'sunset', label: 'Sunset Crimson', color: '#e11d48', accent: '#fb7185' },
  { id: 'ocean', label: 'Oceanic Deep', color: '#2563eb', accent: '#60a5fa' },
];

const THEME_KEY = 'chatter_theme_preference';

export const ThemePicker: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('cyberpunk');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const savedTheme = (localStorage.getItem(THEME_KEY) as ThemeName) || 'cyberpunk';
    setCurrentTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const handleSelectTheme = (themeId: ThemeName) => {
    setCurrentTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem(THEME_KEY, themeId);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        className="spring-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Change Theme Palette"
        style={{
          padding: '8px 12px',
          borderRadius: 10,
          border: '1px solid var(--border-color)',
          background: 'rgba(255, 255, 255, 0.06)',
          color: 'var(--accent)',
          fontSize: '0.82rem',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Palette style={{ width: 16, height: 16 }} />
        <span style={{ display: window.innerWidth <= 640 ? 'none' : 'inline' }}>Theme</span>
      </button>

      {isOpen && (
        <div
          className="glass-panel animate-fade-in"
          style={{
            position: 'absolute',
            top: '115%',
            right: 0,
            width: 220,
            padding: 12,
            borderRadius: 18,
            zIndex: 100,
            background: 'rgba(15, 23, 42, 0.95)',
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.6)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '2px 4px' }}>
            Color Themes
          </div>

          {THEMES.map((t) => {
            const isSelected = currentTheme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleSelectTheme(t.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 12,
                  border: isSelected ? '1px solid var(--accent)' : '1px solid transparent',
                  background: isSelected ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.04)',
                  color: '#fff',
                  fontSize: '0.84rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${t.color}, ${t.accent})`,
                      boxShadow: `0 0 8px ${t.accent}`,
                    }}
                  />
                  <span>{t.label}</span>
                </div>

                {isSelected && <Check style={{ width: 14, height: 14, color: 'var(--accent)' }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
