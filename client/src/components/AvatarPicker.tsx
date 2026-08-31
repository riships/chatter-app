import React, { useRef } from 'react';
import { Camera, Check, Upload } from 'lucide-react';

interface AvatarPickerProps {
  selectedAvatar: string;
  onSelectAvatar: (url: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const AVATAR_OPTIONS = [
  'images/user1.jpg',
  'images/user2.jpg',
  'images/user3.jpg',
];

export const AvatarPicker: React.FC<AvatarPickerProps> = ({
  selectedAvatar,
  onSelectAvatar,
  isOpen,
  onToggle,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress image using HTML5 Canvas to 200x200 max
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          onSelectAvatar(compressedDataUrl);
          onToggle();
        }
      };
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.2rem' }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      <div
        onClick={onToggle}
        style={{
          width: 96,
          height: 96,
          borderRadius: '50%',
          margin: '0 auto',
          position: 'relative',
          cursor: 'pointer',
          border: '3px solid var(--primary)',
          boxShadow: '0 8px 24px rgba(170, 77, 188, 0.4)',
          overflow: 'hidden',
          transition: 'transform 0.2s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <img
          src={selectedAvatar || AVATAR_OPTIONS[0]}
          alt="User Profile"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
        >
          <Camera style={{ color: '#fff', width: 26, height: 26 }} />
        </div>
      </div>

      {isOpen && (
        <div
          className="glass-panel animate-fade-in"
          style={{
            position: 'absolute',
            top: '105%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: 12,
            padding: 14,
            borderRadius: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            zIndex: 60,
            background: 'rgba(15, 23, 42, 0.95)',
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.6)',
            width: 240,
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>
            Choose Profile Picture
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
            {AVATAR_OPTIONS.map((imgUrl, index) => (
              <div
                key={index}
                onClick={() => {
                  onSelectAvatar(imgUrl);
                  onToggle();
                }}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: selectedAvatar === imgUrl ? '2px solid var(--accent)' : '2px solid transparent',
                  position: 'relative',
                }}
              >
                <img src={imgUrl} alt={`Avatar option ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {selectedAvatar === imgUrl && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(168, 85, 247, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check style={{ color: '#fff', width: 16, height: 16 }} />
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 12,
              border: '1px solid var(--primary)',
              background: 'rgba(170, 77, 188, 0.2)',
              color: '#fff',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'background 0.2s ease',
            }}
          >
            <Upload style={{ width: 14, height: 14, color: 'var(--accent)' }} />
            <span>Upload Photo from Computer</span>
          </button>
        </div>
      )}
    </div>
  );
};
