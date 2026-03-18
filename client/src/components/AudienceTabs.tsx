import { useState, useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslation } from '../i18n/I18nContext';

function AnimatedNumber({ end, inV }: { end: number; inV: boolean }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inV) return;
    let start = 0;
    const duration = 2000;
    const step = 16;
    const increment = end / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, step);
    return () => clearInterval(timer);
  }, [inV, end]);

  return <span>{count}</span>;
}

export default function AudienceTabs() {
  const [act, setAct] = useState<'r' | 'v'>('r');
  const ref = useRef(null);
  const inV = useInView(ref, { once: true, margin: '-10%' });
  const { t } = useTranslation();

  const RUNNER_BARS = [
    { label: t('aud.r1'), w: '70%', val: '20 AED' },
    { label: t('aud.r2'), w: '30%', val: '+10 AED' },
    { label: t('aud.r3'), w: '50%', val: '15 AED' },
    { label: t('aud.r4'), w: '40%', val: '~5 AED' },
  ];

  const VENDOR_BENEFITS = [
    { title: t('aud.v1.t'), desc: t('aud.v1.d') },
    { title: t('aud.v2.t'), desc: t('aud.v2.d') },
    { title: t('aud.v3.t'), desc: t('aud.v3.d') },
    { title: t('aud.v4.t'), desc: t('aud.v4.d') },
  ];

  const VENDOR_STATS = [
    { n: '+34%', l: t('aud.s1') },
    { n: '3.2×', l: t('aud.s2') },
    { n: '0 AED', l: t('aud.s3') },
    { n: '4.9★', l: t('aud.s4') },
  ];

  return (
    <section id="vendors" className="aud-sec" ref={ref}>
      <div className="container">
        <div className="aud-in">
          <div className="stag">{t('aud.tag')}</div>
          <div className="tabs">
            <button className={`tbtn ${act === 'r' ? 'a' : ''}`} onClick={() => setAct('r')}>{t('aud.r.tab')}</button>
            <button className={`tbtn ${act === 'v' ? 'a' : ''}`} onClick={() => setAct('v')}>{t('aud.v.tab')}</button>
          </div>

          <div className={`tcont ${act === 'r' ? 'a' : ''}`}>
            <motion.div
              initial={{ opacity: 0, x: -20 }} animate={inV && act === 'r' ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5 }}
            >
              <div className="earn-viz">
                <div className="ebig" style={{ fontSize: '3.5rem' }}>
                  <AnimatedNumber end={55} inV={inV} />
                  <span style={{ fontSize: '2rem', marginLeft: '6px' }}>AED</span>
                </div>
                <div className="eunit">{t('aud.avg')}</div>
                <div className="ebar-wrap">
                  {RUNNER_BARS.map((b, i) => (
                    <div className="ebar-row" key={i}>
                      <div className="ebar-lbl">{b.label}</div>
                      <div className="ebar-track">
                        <div className={`ebar-fill ${inV ? 'an' : ''}`} style={{ '--w': b.w } as React.CSSProperties} />
                      </div>
                      <div className="ebar-v">{b.val}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="perk-grid">
                <div className="pcard">
                  <div className="pcard-ic">⏰</div>
                  <div className="pcard-t">Flexible Schedule</div>
                  <div className="pcard-d">Turn your free hour between classes into easy cash.</div>
                </div>
                <div className="pcard">
                  <div className="pcard-ic">💸</div>
                  <div className="pcard-t">Instant Payouts</div>
                  <div className="pcard-d">Cash out immediately to the campus card or bank.</div>
                </div>
              </div>
            </motion.div>
            <div>
              <div className="shead">Make your<br />downtime<br />count.</div>
              <p className="ssub" style={{ marginTop: 20 }}>No car? No problem. Campus Runner is 100% walking and biking enabled. Work entirely within your own class schedule.</p>
            </div>
          </div>

          <div className={`tcont ${act === 'v' ? 'a' : ''}`}>
             <motion.div
              initial={{ opacity: 0, x: -20 }} animate={inV && act === 'v' ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5 }}
            >
              <div className="shead">Unlock the<br />student<br />economy.</div>
              <p className="ssub" style={{ marginTop: 20 }}>Partnering with Campus Runner gives you zero-friction access to the hardest demographic to reach.</p>
              <div className="vbl" style={{ marginTop: 40 }}>
                {VENDOR_BENEFITS.map((b, i) => (
                  <div className="vb" key={i}>
                    <div className="vbc">✓</div>
                    <div>
                      <div className="vbt">{b.title}</div>
                      <div className="vbd">{b.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={inV && act === 'v' ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="vstat-grid">
                {VENDOR_STATS.map((s, i) => (
                  <div className="vsc" key={i}>
                    <div className="vsn">{s.n}</div>
                    <div className="vsl">{s.l}</div>
                  </div>
                ))}
              </div>
              <div className="pcard">
                <div className="pcard-ic">🤝</div>
                <div className="pcard-t">Merchant Portal</div>
                <div className="pcard-d">Full analytics, menu management, and runner tracking in one seamless dashboard built for vendors.</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
