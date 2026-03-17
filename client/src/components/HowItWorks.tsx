import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslation } from '../i18n/I18nContext';

export default function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-20%' });
  const { t } = useTranslation();

  const STEPS = [
    { n: '01', l: t('hiw.s1.l'), t: t('hiw.s1.t'), d: t('hiw.s1.d'), i: '📍' },
    { n: '02', l: t('hiw.s2.l'), t: t('hiw.s2.t'), d: t('hiw.s2.d'), i: '🍔' },
    { n: '03', l: t('hiw.s3.l'), t: t('hiw.s3.t'), d: t('hiw.s3.d'), i: '🏃' },
  ];

  return (
    <section id="how-it-works" className="hiw-sec" ref={ref}>
      <div className="hiw-in">
        <div className="hiw-top">
          <div>
            <div className="stag">{t('hiw.tag')}</div>
            <h2 className="shead">{t('hiw.head')}</h2>
          </div>
          <p className="ssub">{t('hiw.sub')}</p>
        </div>
        <div className="step-list">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              className="step-row"
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.2 }}
            >
              <div className="snc"><span className="snb">{s.n}</span></div>
              <div className="smc">
                <div className="slbl">{s.l}</div>
                <div className="stitle">{s.t}</div>
                <div className="sdesc">{s.d}</div>
              </div>
              <div className="svc">
                <div className="spill">
                  <span className="spill-ic">{s.i}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
