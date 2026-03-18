import { useEffect, useState } from 'react';
import LoginModal from './LoginModal';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from '../i18n/I18nContext';
import { motion } from 'framer-motion';
import { MotionButton } from './MotionButton';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState('home');
  const [modalOpen, setModalOpen] = useState(false);
  const { t } = useTranslation();

  const NAV_LINKS = [
    { href: '#about', label: t('nav.about') },
    { href: '#how-it-works', label: t('nav.how') },
    { href: '#services', label: t('nav.services') },
    { href: '#students', label: t('nav.community') },
    { href: '#vendors', label: t('nav.vendors') },
    { href: '#app', label: t('nav.app') }
  ];

  useEffect(() => {
    const IDS = ['home', 'about', 'how-it-works', 'services', 'app', 'students', 'waitlist'];
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
      let cur = '';
      IDS.forEach(id => {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 130) cur = id;
      });
      setActiveId(cur);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [t]);

  return (
    <>
      <nav id="nav" className={scrolled ? 'sc' : ''}>
        <motion.a
          whileHover={{ scale: 1.05 }}
          href="#home"
          className="logo"
          style={{ cursor: 'none' }}
        >
          <img src="/logo.png" alt="Skip" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} />
          Skip
        </motion.a>
        <div className="nav-pill">
          {NAV_LINKS.map(l => (
            <motion.a
              key={l.href}
              href={l.href}
              whileHover={{ y: -2 }}
              className={`nav-link ${activeId === l.href.slice(1) ? 'act' : ''}`}
            >
              {l.label}
            </motion.a>
          ))}
          <MotionButton
            variant="primary"
            onClick={() => setModalOpen(true)}
            style={{ padding: '8px 18px', fontSize: '0.8rem' }}
          >
            {t('nav.login')}
          </MotionButton>
          <LanguageSwitcher />
        </div>
      </nav>
      <LoginModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
