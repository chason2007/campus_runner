import { useRef } from 'react';
import { motion, useTransform, useScroll, useSpring } from 'framer-motion';
import { useTranslation } from '../i18n/I18nContext';
export default function Problem() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y1 = useSpring(useTransform(scrollYProgress, [0, 1], [50, -50]), { stiffness: 100, damping: 30 });
  const y2 = useSpring(useTransform(scrollYProgress, [0, 1], [100, -100]), { stiffness: 100, damping: 30 });
  const y3 = useSpring(useTransform(scrollYProgress, [0, 1], [150, -150]), { stiffness: 100, damping: 30 });
  const { t } = useTranslation();

  const CARDS = [
    { i: '🥱', t: t('prob.c1.t'), d: t('prob.c1.d'), y: y1 },
    { i: '📚', t: t('prob.c2.t'), d: t('prob.c2.d'), y: y2 },
    { i: '🖨️', t: t('prob.c3.t'), d: t('prob.c3.d'), y: y3 },
  ];

  return (
    <section id="about" className="prob-sec" ref={ref}>
      <div className="container">
        <div className="prob-in">
          <h2 className="prob-q">
            {t('prob.q1')} <span className="d">{t('prob.q2')}</span><br />
            <span className="l">{t('prob.q3')}</span>
          </h2>
          <div className="prob-grid">
            {CARDS.map((c, i) => (
              <motion.div key={i} className="prob-card" style={{ y: c.y }}>
                <div className="pico">{c.i}</div>
                <div className="ptitle">{c.t}</div>
                <div className="pdesc">{c.d}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
