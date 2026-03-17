import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { useTranslation } from '../i18n/I18nContext';

function CountUp({ target, prefix = '', suffix = '' }: { target: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1400;
    const step = 16;
    const increment = target / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, step);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {prefix}{count}<span className="sunit">{suffix}</span>
    </span>
  );
}

export default function Stats() {
  const { t } = useTranslation();

  const STATS = [
    { value: 15, suffix: ' ' + t('stat.s1'), label: t('stat.l1') },
    { value: 0, suffix: ' AED', label: t('stat.l2') },
    { value: 100, suffix: '%', label: t('stat.l3') },
    { value: 8, suffix: '+', label: t('stat.l4') },
  ];

  return (
    <section className="stat-sec">
      <div className="stat-bg" />
      <motion.div
        className="stat-grid"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.65 }}
      >
        {STATS.map(s => (
          <div className="scard" key={s.label}>
            <div className="sbig">
              <CountUp target={s.value} suffix={s.suffix} />
            </div>
            <div className="sname">{s.label}</div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
