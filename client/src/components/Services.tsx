import { useRef } from 'react';


import { motion, useInView } from 'framer-motion';
import { useTranslation } from '../i18n/I18nContext';

export default function Services() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });
  const { t } = useTranslation();

  const BOXES = [
    { ic: '🍔', t: t('srv.c1.t'), d: t('srv.c1.d'), cls: 'bc w feat', b: 'POPULAR' },
    { ic: '🖨️', t: t('srv.c2.t'), d: t('srv.c2.d'), cls: 'bc', b: '' },
    { ic: '📚', t: t('srv.c3.t'), d: t('srv.c3.d'), cls: 'bc', b: '' },
    { ic: '✨', t: t('srv.c4.t'), d: t('srv.c4.d'), cls: 'bc w', b: 'ANYTHING' },
  ];

  return (
    <section id="services" className="srv-sec" ref={ref}>
      <div className="container">
        <div className="srv-in">
          <div className="srv-top">
            <div>
              <div className="stag">{t('srv.tag')}</div>
              <h2 className="shead" style={{ marginBottom: 0 }}>{t('srv.head')}</h2>
            </div>
          </div>
          <div className="bento">
            {BOXES.map((b, i) => (
              <motion.div
                key={i}
                className={b.cls}
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                {b.b && <div className="bbadge">{b.b}</div>}
                <span className="bico">{b.ic}</span>
                <div className="btitle" dangerouslySetInnerHTML={{ __html: b.t }} />
                <div className="bdesc">{b.d}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
