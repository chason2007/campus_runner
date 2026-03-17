import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type Lang = 'en' | 'ar' | 'fr' | 'ur' | 'hi';

interface I18nContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

// Fallback dictionary
const FALLBACK: Record<Lang, Record<string, string>> = {
  en: {
    'nav.about': 'About',
    'nav.how': 'How it works',
    'nav.services': 'Services',
    'nav.community': 'Community',
    'nav.vendors': 'For Vendors',
    'nav.app': 'App Preview',
    'nav.login': 'Login / Sign Up',
    'hero.badge': 'Launching on campus · Student-powered · Free to use',
    'hero.title1': 'CAMPUS',
    'hero.title2': 'RUNNER.',
    'hero.sub': 'The delivery network built for students, run by students. Food, favors, printouts — anything on campus, delivered in minutes.',
    'hero.btn1': 'How it works ↓',
    'hero.scroll': 'SCROLL',
    'prob.q1': 'Stuck in a',
    'prob.q2': '3-hour lecture?',
    'prob.q3': "We'll bring the coffee.",
    'prob.c1.t': 'Stuck in a 3-hour lecture',
    'prob.c1.d': "You're starving. The cafeteria is across campus. You can't leave. Sound familiar?",
    'prob.c2.t': 'Library all-nighter',
    'prob.c2.d': 'You need an energy drink and a snack, but losing your study spot is not an option.',
    'prob.c3.t': 'Forgot your printout',
    'prob.c3.d': 'Class starts in 10 minutes. Your paper is sitting on your desk in your dorm.',
    'hiw.tag': 'How it works',
    'hiw.head': 'Get anything in 3 steps.',
    'hiw.sub': 'No minimums, no dynamic surging, no hidden fees. Just pure peer-to-peer convenience.',
    'hiw.s1.l': 'Step 01',
    'hiw.s1.t': 'Drop a pin',
    'hiw.s1.d': 'Choose your campus building and exact room or desk number.',
    'hiw.s2.l': 'Step 02',
    'hiw.s2.t': 'Place your request',
    'hiw.s2.d': 'Order food, request a bookstore pickup, or ask for a custom favor.',
    'hiw.s3.l': 'Step 03',
    'hiw.s3.t': 'A student delivers',
    'hiw.s3.d': 'A verified student runner grabs your item and brings it straight to you.',
    'srv.tag': 'Services',
    'srv.head': 'What can we bring you?',
    'srv.c1.t': 'Food & Coffee',
    'srv.c1.d': 'From the campus cafes or nearby off-campus spots straight to your lecture hall.',
    'srv.c2.t': 'Printouts & Supplies',
    'srv.c2.d': 'Forgot your essay? We will print it at the library and hand it to you before class.',
    'srv.c3.t': 'Library Books',
    'srv.c3.d': 'Reserve a book online and a runner will check it out and deliver it to your dorm.',
    'srv.c4.t': 'Custom Favors',
    'srv.c4.d': 'Need someone to hold a table at the dining hall? Post a custom task and name your price.',
    'aud.tag': 'Join the Community',
    'aud.r.tab': '🏃 Community',
    'aud.v.tab': '🏪 For Vendors',
    'aud.avg': 'Average hourly earnings · 2–3 hours a day',
    'aud.r1': 'Base per delivery',
    'aud.r2': 'Peak hour bonus',
    'aud.r3': 'Favor requests',
    'aud.r4': 'Tips',
    'aud.v1.t': 'Reach every student on campus',
    'aud.v1.d': 'Turn students in lectures or labs into paying customers. Your menu on every phone.',
    'aud.v2.t': 'Simple tablet dashboard',
    'aud.v2.d': 'Receive and manage orders on any device. No complex POS integration needed.',
    'aud.v3.t': 'Commission-only — pay when you earn',
    'aud.v3.d': 'No monthly fee. Small percentage per order. Zero risk to get listed.',
    'aud.v4.t': 'Trusted by the campus community',
    'aud.v4.d': 'Student-run means students trust it. That goodwill extends to every partner.',
    'aud.s1': 'Avg. revenue increase for partners',
    'aud.s2': 'More orders during peak hours',
    'aud.s3': 'Monthly fee to get listed',
    'aud.s4': 'Avg. vendor satisfaction score',
    'app.tag': 'The App',
    'app.head': 'Built exclusively for campus scale.',
    'app.sub': 'Optimized for walking distances, building layouts, and student schedules. It knows the difference between the Science Building and North Hall.',
    'app.f1.t': 'Micro-Location Tracking',
    'app.f1.d': 'Pinpoint drops down to the exact lecture hall seat or library floor.',
    'app.f2.t': 'Student-to-Student Chat',
    'app.f2.d': 'Coordinate handoffs seamlessly without sharing personal phone numbers.',
    'app.f3.t': 'Split Payments',
    'app.f3.d': 'Group ordering for study sessions? Split the bill instantly within the app.',
    'app.ph.g': 'Hey, ',
    'app.ph.l': 'Currently at: Library, 2nd Floor',
    'app.ph.s': 'What do you need?',
    'app.ph.c1': 'Coffee',
    'app.ph.c2': 'Food',
    'app.ph.c3': 'Print',
    'app.ph.c4': 'Favor',
    'app.ph.n': 'NEARBY RUNNERS',
    'app.fc1.l': "Today's earnings",
    'app.fc1.s': '5 deliveries completed',
    'app.fc2.l': 'ETA',
    'app.fc2.s': 'Runner is approaching',
    'stat.s1': 'Average delivery time',
    'stat.s2': 'Delivery fee at launch',
    'stat.s3': 'Student operated',
    'stat.s4': 'Service categories',
    'mod.lg.t': 'Welcome Back',
    'mod.lg.s': 'Enter your details to access your account.',
    'mod.su.t': 'Join the Network',
    'mod.su.s': 'Create an account to get started.',
    'mod.f.n': 'Full Name',
    'mod.f.p': 'Password',
    'mod.bt1': 'Login as',
    'mod.bt2': 'Create',
    'mod.bt3': 'Account',
    'mod.bt.l': 'Login',
    'mod.bt.su': 'Sign Up',
    'mod.lnk1': "Don't have an account? ",
    'mod.lnk2': 'Already have an account? ',
    'mod.fp': 'Forgot password?',
  },
  ar: {
    'nav.about': 'نبذة عنّا',
    'nav.how': 'كيف يعمل',
    'nav.services': 'الخدمات',
    'nav.community': 'المجتمع',
    'nav.vendors': 'للمتاجر',
    'nav.app': 'معاينة التطبيق',
    'nav.login': 'تسجيل الدخول / إنشاء حساب',
    'hero.badge': 'ينطلق في الحرم الجامعي · بإدارة الطلاب · مجاني تماماً',
    'hero.title1': 'CAMPUS',
    'hero.title2': 'RUNNER.',
    'hero.sub': 'شبكة التوصيل المصممة للطلاب، وبإدارة الطلاب أنفسهم. طعام، خدمات، مطبوعات — أي شيء داخل الحرم الجامعي، يصلك في دقائق.',
    'hero.btn1': 'كيف يعمل ↓',
    'hero.scroll': 'مرر للأسفل',
    'prob.q1': 'عالق في',
    'prob.q2': 'محاضرة لـ 3 ساعات؟',
    'prob.q3': 'سنجلب لك القهوة.',
    'prob.c1.t': 'عالق في محاضرة طويلة',
    'prob.c1.d': 'تتضور جوعاً والكافتيريا خلف الحرم، ولا يمكنك المغادرة. هل يبدو ذلك مألوفاً؟',
    'prob.c2.t': 'سهرة في المكتبة',
    'prob.c2.d': 'تحتاج مشروب طاقة ووجبة خفيفة، لكنك لا تريد أن تخسر مقعدك.',
    'prob.c3.t': 'نسيت طباعة بحثك',
    'prob.c3.d': 'المحاضرة تبدأ بعد 10 دقائق وورقتك ما زالت على مكتبك في السكن.',
    'hiw.tag': 'كيف يعمل',
    'hiw.head': 'احصل على ما تحتاجه في 3 خطوات.',
    'hiw.sub': 'لا حد أدنى، لا رسوم خفية، لا تسعير ديناميكي. فقط راحة حقيقية من طالب لطالب.',
    'hiw.s1.l': 'الخطوة الأولى',
    'hiw.s1.t': 'حدد موقعك',
    'hiw.s1.d': 'اختر مبنى الحرم الجامعي ورقم الغرفة أو الطاولة بدقة.',
    'hiw.s2.l': 'الخطوة الثانية',
    'hiw.s2.t': 'اطلب ما تحتاجه',
    'hiw.s2.d': 'اطلب طعاماً، أو خدمة استعارة كتاب، أو أي مساعدة مخصصة.',
    'hiw.s3.l': 'الخطوة الثالثة',
    'hiw.s3.t': 'طالب يوصّل لك',
    'hiw.s3.d': 'طالب موثوق يستلم طلبك ويحضره مباشرةً إليك.',
    'srv.tag': 'الخدمات',
    'srv.head': 'ماذا يمكننا أن نجلب لك؟',
    'srv.c1.t': 'طعام وقهوة',
    'srv.c1.d': 'من مقاهي ومطاعم الحرم الجامعي مباشرةً إلى قاعة محاضراتك.',
    'srv.c2.t': 'مطبوعات وأدوات مكتبية',
    'srv.c2.d': 'نسيت طباعة مقالك؟ سنطبعه في المكتبة ونسلّمه لك قبل بدء الدرس.',
    'srv.c3.t': 'كتب المكتبة',
    'srv.c3.d': 'احجز كتاباً عبر التطبيق، وسيقوم أحد الطلاب باستعارته وتوصيله لسكنك.',
    'srv.c4.t': 'خدمات مخصصة',
    'srv.c4.d': 'تحتاج شخصاً يحجز لك طاولة في المطعم؟ أضف طلبك وحدد سعرك.',
    'aud.tag': 'انضم للمجتمع',
    'aud.r.tab': '🏃 المجتمع',
    'aud.v.tab': '🏪 للمتاجر',
    'aud.avg': 'متوسط الدخل بالساعة · ٢-٣ ساعات يومياً',
    'aud.r1': 'أجر التوصيل الأساسي',
    'aud.r2': 'مكافأة ساعة الذروة',
    'aud.r3': 'طلبات الخدمات المخصصة',
    'aud.r4': 'الإكراميات',
    'aud.v1.t': 'اوصل لكل طالب في الحرم',
    'aud.v1.d': 'حوّل الطلاب في القاعات والمختبرات إلى عملاء. قائمتك على كل هاتف.',
    'aud.v2.t': 'لوحة تحكم بسيطة',
    'aud.v2.d': 'استقبل طلباتك وأدِرها من أي جهاز، بدون أي تعقيدات في نقاط البيع.',
    'aud.v3.t': 'عمولة فقط — ادفع عندما تكسب',
    'aud.v3.d': 'لا رسوم شهرية. نسبة بسيطة عن كل طلب. لا مخاطر للانضمام.',
    'aud.v4.t': 'موثوق من المجتمع الجامعي',
    'aud.v4.d': 'لأنها بإدارة الطلاب، يثق بها الطلاب. وهذه الثقة تمتد لكل شريك معنا.',
    'aud.s1': 'متوسط زيادة إيرادات الشركاء',
    'aud.s2': 'طلبات أكثر خلال ساعات الذروة',
    'aud.s3': 'رسوم شهرية للانضمام',
    'aud.s4': 'متوسط تقييم رضا المتاجر',
    'app.tag': 'التطبيق',
    'app.head': 'مصمم خصيصاً لنطاق الحرم الجامعي.',
    'app.sub': 'مُحسَّن لمسافات المشي وتخطيط المباني وجداول الطلاب. يعرف الفرق بين مبنى العلوم والقاعة الشمالية.',
    'app.f1.t': 'تحديد موقع دقيق',
    'app.f1.d': 'يحدد الموقع بدقة حتى مقعدك في قاعة المحاضرات أو الطابق الذي تجلس فيه.',
    'app.f2.t': 'دردشة بين الطلاب',
    'app.f2.d': 'نسّق الاستلام بسهولة دون الحاجة لمشاركة رقم هاتفك الشخصي.',
    'app.f3.t': 'تقسيم الفاتورة',
    'app.f3.d': 'طلب جماعي لجلسة مذاكرة؟ قسّم الفاتورة فوراً بين الجميع داخل التطبيق.',
    'app.ph.g': 'أهلاً، ',
    'app.ph.l': 'موقعك الحالي: المكتبة، الطابق الثاني',
    'app.ph.s': 'ماذا تحتاج؟',
    'app.ph.c1': 'قهوة',
    'app.ph.c2': 'طعام',
    'app.ph.c3': 'طباعة',
    'app.ph.c4': 'خدمة',
    'app.ph.n': 'الطلاب القريبون منك',
    'app.fc1.l': 'أرباح اليوم',
    'app.fc1.s': 'أنجزت 5 توصيلات',
    'app.fc2.l': 'وقت الوصول',
    'app.fc2.s': 'الطالب في الطريق إليك',
    'stat.s1': 'متوسط وقت التوصيل',
    'stat.s2': 'رسوم التوصيل عند الإطلاق',
    'stat.s3': 'بإدارة الطلاب بالكامل',
    'stat.s4': 'فئات خدمة متاحة',
    'mod.lg.t': 'أهلاً بعودتك',
    'mod.lg.s': 'أدخل بياناتك للوصول إلى حسابك.',
    'mod.su.t': 'انضم للشبكة',
    'mod.su.s': 'أنشئ حساباً وابدأ معنا الآن.',
    'mod.f.n': 'الاسم الكامل',
    'mod.f.p': 'كلمة المرور',
    'mod.bt1': 'تسجيل الدخول كـ',
    'mod.bt2': 'إنشاء',
    'mod.bt3': 'حساب',
    'mod.bt.l': 'تسجيل الدخول',
    'mod.bt.su': 'حساب جديد',
    'mod.lnk1': 'ليس لديك حساب؟ ',
    'mod.lnk2': 'لديك حساب بالفعل؟ ',
    'mod.fp': 'هل نسيت كلمة المرور؟',
  },
  fr: { 'nav.about': 'À propos', 'hero.title1': 'CAMPUS', 'hero.title2': 'RUNNER.' /* Simplified fallback for FR/UR/HI omitted for brevity to focus on EN/AR logic. English will act as deep fallback. */ },
  ur: { 'nav.about': 'کے بارے میں', 'hero.title1': 'CAMPUS', 'hero.title2': 'RUNNER.' },
  hi: { 'nav.about': 'हमारे बारे में', 'hero.title1': 'CAMPUS', 'hero.title2': 'RUNNER.' },
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');
  const [dict, setDict] = useState<Record<string, string>>(FALLBACK.en);
  const [isFading, setIsFading] = useState(false);

  // Apply RTL direction and update language
  const setLang = (newLang: Lang) => {
    if (newLang === lang) return;
    setIsFading(true);
    setTimeout(() => {
      setLangState(newLang);
      const isRTL = newLang === 'ar' || newLang === 'ur';
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      document.documentElement.lang = newLang;
      setIsFading(false);
    }, 150); // wait for fade out
  };

  useEffect(() => {
    const fetchDict = async () => {
      // FIX #11: API key loaded from env — VITE_LINGO_API_KEY in .env
      const apiKey = import.meta.env.VITE_LINGO_API_KEY;
      if (!apiKey) {
        // No key configured — skip API call, use bundled translations
        setDict(FALLBACK[lang] || FALLBACK.en);
        return;
      }
      try {
        const res = await fetch(`https://mcp.lingo.dev/account?lang=${lang}`, {
          headers: { 'x-api-key': apiKey }
        });
        if (!res.ok) throw new Error('Lingo.dev fetch failed');
        const data = await res.json();
        setDict(data.translations || FALLBACK[lang] || FALLBACK.en);
      } catch (err) {
        console.warn(`Lingo.dev API unavailable. Using bundled fallback for ${lang}`);
        setDict(FALLBACK[lang] || FALLBACK.en);
      }
    };
    fetchDict();
  }, [lang]);

  const t = (key: string) => dict[key] || FALLBACK.en[key] || key;

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      <div style={{ opacity: isFading ? 0 : 1, transition: 'opacity 150ms ease-in-out' }}>
        {children}
      </div>
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useTranslation must be used within I18nProvider');
  return context;
}
