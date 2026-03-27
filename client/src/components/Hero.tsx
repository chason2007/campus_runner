import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from '../i18n/I18nContext';
import { MagneticButton } from './MagneticButton';

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const gridY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const { t } = useTranslation();

  return (
    <section id="home" className="hero" ref={ref}>
      <div className="hglow" />
      <motion.div className="hgrid" style={{ y: gridY }} />
      <div className="container">
        <div className="hcontent">
          <motion.div
            className="heyebrow"
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="edot" />
            <span>{t('hero.badge')}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {t('hero.title1')}<br />
            <span className="ghost">{t('hero.title2')}</span>
          </motion.h1>

          <motion.p
            className="hsub"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {t('hero.sub')}
          </motion.p>

          <motion.div
            className="hbtns"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <MagneticButton
              onClick={() => {
                const el = document.getElementById('how-it-works');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{ padding: '0' }} // Reset padding as MagneticButton handles it
            >
              {t('hero.btn1')}
            </MagneticButton>
          </motion.div>
        </div>
      </div>
      <motion.div
        className="hscroll"
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
      >
        <div className="sline" />
        <span>{t('hero.scroll')}</span>
      </motion.div>
    </section>
  );
}
