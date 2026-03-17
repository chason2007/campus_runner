import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../i18n/I18nContext';

const LANGS = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ar', label: 'العربية', short: 'AR' },
  { code: 'fr', label: 'Français', short: 'FR' },
  { code: 'ur', label: 'اردو', short: 'UR' },
  { code: 'hi', label: 'हिन्दी', short: 'HI' },
] as const;

export default function LanguageSwitcher() {
  const { lang, setLang } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clickOut = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', clickOut);
    return () => document.removeEventListener('mousedown', clickOut);
  }, [open]);

  const activeLang = LANGS.find(l => l.code === lang) || LANGS[0];
  const isRTL = document.documentElement.dir === 'rtl';

  return (
    <div ref={ref} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'var(--surface)', border: '1px solid var(--border2)',
          borderRadius: '100px', padding: '7px 14px', color: 'var(--text)',
          fontSize: '0.8rem', fontWeight: 600, cursor: 'none', transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text)'; }}
      >
        <span style={{ fontSize: '0.9rem' }}>🌐</span>
        {activeLang.short}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', top: 'calc(100% + 10px)',
              [isRTL ? 'left' : 'right']: 0,
              background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: '14px', padding: '6px', width: '140px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.8), 0 0 20px rgba(0,212,255,0.05)',
              display: 'flex', flexDirection: 'column', zIndex: 1000,
            }}
          >
            {LANGS.map(l => {
              const isActive = l.code === lang;
              return (
                <button
                  key={l.code}
                  onClick={() => { setLang(l.code); setOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', padding: '10px 14px', background: 'transparent',
                    border: 'none', borderInlineStart: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                    color: isActive ? 'var(--text)' : 'var(--text2)',
                    fontSize: '0.85rem', fontWeight: isActive ? 600 : 400,
                    textAlign: isRTL ? 'right' : 'left', cursor: 'none', transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--surface)';
                    if (!isActive) e.currentTarget.style.color = 'var(--text)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    if (!isActive) e.currentTarget.style.color = 'var(--text2)';
                  }}
                >
                  {l.label}
                  {isActive && <span style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>✓</span>}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
