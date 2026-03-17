import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslation } from '../i18n/I18nContext';

export default function AppPreview() {
  const ref = useRef(null);
  const inV = useInView(ref, { once: true, margin: '-20%' });
  const { t } = useTranslation();

  const handleM = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1000px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const resetM = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'perspective(1000px) rotateY(-8deg) rotateX(4deg)';
  };

  const FEATS = [
    { i: '📍', t: t('app.f1.t'), d: t('app.f1.d') },
    { i: '💬', t: t('app.f2.t'), d: t('app.f2.d') },
    { i: '🍕', t: t('app.f3.t'), d: t('app.f3.d') },
  ];

  return (
    <section id="app" className="prev-sec" ref={ref}>
      <div className="prev-glow" />
      <div className="prev-in">
        <motion.div
          initial={{ opacity: 0, x: -30 }} animate={inV ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="stag">{t('app.tag')}</div>
          <h2 className="shead" style={{ marginBottom: 12 }}>{t('app.head')}</h2>
          <p className="ssub">{t('app.sub')}</p>
          <div className="prev-feats">
            {FEATS.map((f, i) => (
              <motion.div className="pf" key={i} initial={{ opacity: 0, x: -20 }} animate={inV ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.3 + i * 0.1 }}>
                <div className="pfic">{f.i}</div>
                <div><div className="pft">{f.t}</div><div className="pfs">{f.d}</div></div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="ph-wrap"
          initial={{ opacity: 0, y: 40, scale: 0.9 }} animate={inV ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="phone" style={{ transform: 'perspective(1000px) rotateY(-8deg) rotateX(4deg)' }} onMouseMove={handleM} onMouseLeave={resetM}>
            <div className="ph-notch" />
            <div className="ph-screen">
              <div className="apt">
                <div className="apt-row">
                  <div className="atime">11:42 AM</div>
                  <div className="atime" style={{ fontSize: '0.55rem' }}>🔋 84%</div>
                </div>
                <div className="agreet" dangerouslySetInnerHTML={{ __html: t('app.ph.g') }} />
                <div className="aloc">{t('app.ph.l')}</div>
              </div>
              <div className="asrch">🔍 {t('app.ph.s')}</div>
              <div className="acats">
                <div className="acat a"><div className="aci">☕</div>{t('app.ph.c1')}</div>
                <div className="acat"><div className="aci">🍔</div>{t('app.ph.c2')}</div>
                <div className="acat"><div className="aci">🖨️</div>{t('app.ph.c3')}</div>
                <div className="acat"><div className="aci">✨</div>{t('app.ph.c4')}</div>
              </div>
              <div className="ash">{t('app.ph.n')}</div>
              <div className="arest">
                <div className="ari">🍔<div className="arb">1.2km</div></div>
                <div className="arinf">
                  <div className="arname">Jordan S.</div>
                  <div className="armeta">
                    <div className="armtag g">● Active</div>
                    <div className="armtag">⭐ 4.9 (124)</div>
                  </div>
                </div>
              </div>
              <div className="afav">
                <div className="fic">✨</div>
                <div><div className="ftitle">Request Custom Favor</div><div className="fsub">Name your price</div></div>
                <div className="farr">→</div>
              </div>
              <div className="anav">
                <div className="ant a"><div className="ani">🏠</div>Home</div>
                <div className="ant"><div className="ani">📋</div>Orders</div>
                <div className="ant"><div className="ani">💬</div>Chat</div>
                <div className="ant"><div className="ani">👤</div>Profile</div>
              </div>
            </div>
            
            <div className="fc-float fc1">
              <div className="fc-lbl">{t('app.fc1.l')}</div>
              <div className="fc-val">125.00 <span style={{ fontSize: '1rem' }}>AED</span></div>
              <div className="fc-sub">{t('app.fc1.s')}</div>
            </div>
            <div className="fc-float fc2">
              <div className="fc-lbl">{t('app.fc2.l')}</div>
              <div className="fc-val">4 <span style={{ fontSize: '1rem' }}>min</span></div>
              <div className="fc-st">
                <div className="fc-dot" />
                <div className="fc-stxt">{t('app.fc2.s')}</div>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
