import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { MotionButton } from './MotionButton';


/* ─────────────────────────── types ─────────────────────────── */
type Tab = 'Student' | 'Runner' | 'Vendor';
type Mode = 'login' | 'signup';



/* ─────────────────────────── helpers ─────────────────────────── */
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 18px',
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(10px)',
  border: '1px solid var(--border2)',
  borderRadius: '16px',
  color: 'var(--text)',
  fontSize: '0.9rem',
  outline: 'none',
  fontFamily: "'Instrument Sans', sans-serif",
  boxSizing: 'border-box',
  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
};

const lbl: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 600,
  color: 'var(--text2)',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  fontFamily: "'Instrument Sans', sans-serif",
};

const focusInput = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.borderColor = 'var(--accent)';
  e.target.style.boxShadow = '0 0 0 3px rgba(0,212,255,0.1)';
};
const blurInput = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.borderColor = 'var(--border2)';
  e.target.style.boxShadow = 'none';
};

/* ─────────────────────────── EyeIcon ─────────────────────────── */
function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8" /><circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

/* ─────────────────────────── PasswordInput ─────────────────────────── */
function PasswordInput({ placeholder, value, onChange, error }: {
  placeholder: string; value: string;
  onChange: (v: string) => void; error?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ ...inputStyle, paddingRight: '44px', borderColor: error ? '#ff6b6b' : undefined }}
        onFocus={focusInput}
        onBlur={blurInput}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'none', color: show ? 'var(--text)' : 'var(--text3)', padding: 0, display: 'flex', alignItems: 'center' }}
      >
        <EyeIcon open={show} />
      </button>
      {error && <p style={{ color: '#ff6b6b', fontSize: '0.75rem', marginTop: '4px', marginBottom: 0 }}>{error}</p>}
    </div>
  );
}

/* ─────────────────────────── FileUpload ─────────────────────────── */
function FileUpload({ label, subtext, maxMB, value, onChange, error }: {
  label: string; subtext: string; maxMB: number;
  value: File | null; onChange: (f: File | null) => void; error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hover, setHover] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleFile = (f: File | null) => {
    if (!f) return onChange(null);
    if (f.size > maxMB * 1024 * 1024) return;
    onChange(f);
  };

  const active = hover || dragging;

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0] || null); }}
        style={{
          border: `1.5px dashed ${active ? 'rgba(0,212,255,0.5)' : error ? '#ff6b6b' : 'rgba(0,212,255,0.25)'}`,
          borderRadius: '14px',
          padding: '20px',
          background: active ? 'rgba(0,212,255,0.06)' : 'rgba(0,212,255,0.03)',
          cursor: 'none',
          textAlign: 'center',
          transition: 'border-color 0.2s, background 0.2s',
        }}
      >
        {value ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <span style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 500 }}>📄 {value.name}</span>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onChange(null); }}
              style={{ background: 'rgba(255,107,107,0.15)', border: 'none', borderRadius: '50%', width: '22px', height: '22px', color: '#ff6b6b', cursor: 'none', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >✕</button>
          </div>
        ) : (
          <>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(0,212,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 8px' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p style={{ color: 'var(--text2)', fontSize: '0.82rem', margin: '0 0 4px', fontWeight: 500 }}>{label}</p>
            <p style={{ color: 'var(--text3)', fontSize: '0.75rem', margin: 0 }}>{subtext} — JPG, PNG, PDF up to {maxMB}MB</p>
          </>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0] || null)} />
      {error && <p style={{ color: '#ff6b6b', fontSize: '0.75rem', marginTop: '4px', marginBottom: 0 }}>{error}</p>}
    </div>
  );
}



/* ─────────────────────────── TextInput ─────────────────────────── */
function TextInput({ type = 'text', placeholder, value, onChange, error }: {
  type?: string; placeholder: string; value: string;
  onChange: (v: string) => void; error?: string;
}) {
  return (
    <div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ ...inputStyle, borderColor: error ? '#ff6b6b' : undefined }}
        onFocus={focusInput}
        onBlur={blurInput}
      />
      {error && <p style={{ color: '#ff6b6b', fontSize: '0.75rem', marginTop: '4px', marginBottom: 0 }}>{error}</p>}
    </div>
  );
}

/* ─────────────────────────── SUCCESS ─────────────────────────── */
function SuccessState() {
  return (
    <div style={{ textAlign: 'center', padding: '32px 16px' }}>
      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(0,212,255,0.12)', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.4rem', letterSpacing: '0.04em', color: 'var(--text)', lineHeight: 1, marginBottom: '10px' }}>Account Created!</div>
      <p style={{ color: 'var(--text2)', fontSize: '0.9rem', lineHeight: 1.55, margin: 0 }}>
        We're reviewing your details.<br />Check your inbox for next steps.
      </p>
    </div>
  );
}

/* ─────────────────────────── STUDENT / RUNNER SIGNUP ─────────────────────────── */
function StudentRunnerSignup({ isRunner, onSuccess }: { isRunner: boolean; onSuccess: () => void }) {
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [idFile, setIdFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { login } = useAuth();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = 'Full name is required.';
    if (!studentId.trim()) e.studentId = 'Student ID is required.';
    else if (!/^1000\d{5}$/.test(studentId)) e.studentId = 'Must be 1000 followed by 5 digits.';
    if (!email.trim()) e.email = 'Email is required.';
    else if (!email.includes('@')) e.email = 'Enter a valid email address.';
    if (!password) e.password = 'Password is required.';
    else if (password.length < 8) e.password = 'At least 8 characters required.';
    if (!confirmPw) e.confirmPw = 'Please confirm your password.';
    else if (password !== confirmPw) e.confirmPw = 'Passwords do not match.';
    if (!idFile) e.idFile = 'Please upload your ID document.';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setLoading(true);
      try {
        const data = await api.auth.register({
          name: fullName,
          email,
          password,
          role: isRunner ? 'runner' : 'student',
          campusId: studentId,
        });
        login(data.user, data.token);
        showToast('Welcome to Campus Runner!', 'success');
        onSuccess();
      } catch (err: any) {
        showToast(err.message || 'An error occurred during signup.', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={lbl}>Full Name</label>
        <TextInput placeholder="Your full name" value={fullName} onChange={setFullName} error={errors.fullName} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={lbl}>Student ID Number</label>
        <TextInput placeholder="1000XXXXX" value={studentId} onChange={setStudentId} error={errors.studentId} />
        {!errors.studentId && <p style={{ color: 'var(--text3)', fontSize: '0.73rem', marginTop: '2px', marginBottom: 0 }}>Your 9-digit university ID</p>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={lbl}>Email Address</label>
        <TextInput type="email" placeholder="your@university.edu" value={email} onChange={setEmail} error={errors.email} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={lbl}>Password</label>
        <PasswordInput placeholder="Create a password" value={password} onChange={setPassword} error={errors.password} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={lbl}>Confirm Password</label>
        <PasswordInput placeholder="Confirm your password" value={confirmPw} onChange={setConfirmPw} error={errors.confirmPw} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={lbl}>Attach ID</label>
        <FileUpload
          label="Upload Emirates ID or Student ID Card"
          subtext="Drag and drop or click to browse"
          maxMB={5}
          value={idFile}
          onChange={setIdFile}
          error={errors.idFile}
        />
      </div>
      <MotionButton
        type="submit"
        disabled={loading}
        style={{ width: '100%', padding: '16px', marginTop: '4px' }}
      >
        {loading ? 'Processing...' : isRunner ? 'Create Runner Account' : 'Create Student Account'}
      </MotionButton>
      {isRunner && (
        <p style={{ color: 'var(--text3)', fontSize: '0.74rem', textAlign: 'center', margin: '2px 0 0', lineHeight: 1.5 }}>
          Runner accounts are reviewed within 24 hours before activation.
        </p>
      )}
    </form>
  );
}

/* ─────────────────────────── VENDOR SIGNUP ─────────────────────────── */
function VendorSignup({ onSuccess }: { onSuccess: () => void }) {
  const [bizName, setBizName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [staffId, setStaffId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [staffFile, setStaffFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { login } = useAuth();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!bizName.trim()) e.bizName = 'Business name is required.';
    if (!ownerName.trim()) e.ownerName = 'Owner name is required.';
    if (!licenseNo.trim()) e.licenseNo = 'License number is required.';
    if (!staffId.trim()) e.staffId = 'Staff ID is required.';
    if (!email.trim()) e.email = 'Email is required.';
    else if (!email.includes('@')) e.email = 'Enter a valid email address.';
    if (!password) e.password = 'Password is required.';
    else if (password.length < 8) e.password = 'At least 8 characters required.';
    if (!confirmPw) e.confirmPw = 'Please confirm your password.';
    else if (password !== confirmPw) e.confirmPw = 'Passwords do not match.';
    if (!licenseFile) e.licenseFile = 'Please upload your business license.';
    if (!staffFile) e.staffFile = 'Please upload your employee ID.';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setLoading(true);
      try {
        const data = await api.auth.register({
          name: ownerName,
          email,
          password,
          role: 'vendor',
        });
        login(data.user, data.token);
        showToast('Vendor registration initiated!', 'success');
        onSuccess();
      } catch (err: any) {
        showToast(err.message || 'An error occurred during signup.', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={lbl}>Business Name</label>
        <TextInput placeholder="e.g. Campus Slice Co." value={bizName} onChange={setBizName} error={errors.bizName} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={lbl}>Manager / Owner Name</label>
        <TextInput placeholder="Full name of account holder" value={ownerName} onChange={setOwnerName} error={errors.ownerName} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={lbl}>Business License Number</label>
        <TextInput placeholder="License number as on official document" value={licenseNo} onChange={setLicenseNo} error={errors.licenseNo} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={lbl}>Employee / Staff ID</label>
        <TextInput placeholder="Your staff or employee ID" value={staffId} onChange={setStaffId} error={errors.staffId} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={lbl}>Email Address</label>
        <TextInput type="email" placeholder="business@campus.edu" value={email} onChange={setEmail} error={errors.email} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={lbl}>Password</label>
        <PasswordInput placeholder="Create a password" value={password} onChange={setPassword} error={errors.password} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={lbl}>Confirm Password</label>
        <PasswordInput placeholder="Confirm your password" value={confirmPw} onChange={setConfirmPw} error={errors.confirmPw} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={lbl}>Business License</label>
        <FileUpload
          label="Upload Business License Document"
          subtext="Drag and drop or click to browse"
          maxMB={10}
          value={licenseFile}
          onChange={setLicenseFile}
          error={errors.licenseFile}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={lbl}>Employee ID</label>
        <FileUpload
          label="Upload Employee ID or Staff Card"
          subtext="Drag and drop or click to browse"
          maxMB={5}
          value={staffFile}
          onChange={setStaffFile}
          error={errors.staffFile}
        />
      </div>
      <MotionButton
        type="submit"
        disabled={loading}
        style={{ width: '100%', padding: '16px', marginTop: '4px' }}
      >
        {loading ? 'Processing...' : 'Create Vendor Account'}
      </MotionButton>
      <p style={{ color: 'var(--text3)', fontSize: '0.74rem', textAlign: 'center', margin: '2px 0 0', lineHeight: 1.5 }}>
        Vendor accounts are manually verified within 48 hours.<br />You will receive a confirmation email once approved.
      </p>
    </form>
  );
}

/* ─────────────────────────── LOGIN FORM ─────────────────────────── */
function LoginForm({ tab }: { tab: Tab }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      const data = await api.auth.login(email, password);
      authLogin(data.user, data.token);
      showToast(`Welcome back, ${data.user.name.split(' ')[0]}`, 'success');

      // Redirect based on backend role using React Router navigate
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else if (data.user.role === 'student') {
        navigate('/student');
      } else if (data.user.role === 'runner') {
        navigate('/runner');
      } else if (data.user.role === 'vendor') {
        navigate('/vendor');
      }
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={lbl}>Email Address</label>
        <TextInput type="email" placeholder={tab === 'Vendor' ? 'business@campus.edu' : 'your@university.edu'} value={email} onChange={setEmail} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={lbl}>Password</label>
        <PasswordInput placeholder="Your password" value={password} onChange={setPassword} />
        <div style={{ textAlign: 'right', marginTop: '-2px' }}>
          <a href="#" style={{ color: 'var(--text3)', fontSize: '0.75rem', textDecoration: 'none', transition: 'color 0.2s', cursor: 'none' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}>Forgot password?</a>
        </div>
      </div>
      <MotionButton
        type="submit"
        disabled={loading}
        style={{ width: '100%', padding: '16px' }}
      >
        {loading ? 'Logging in...' : `Log In as ${tab}`}
      </MotionButton>
    </form>
  );
}

/* ─────────────────────────── MAIN MODAL ─────────────────────────── */
export default function LoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('Student');
  const [mode, setMode] = useState<Mode>('login');
  const [success, setSuccess] = useState(false);

  // Reset mode when tab changes
  const handleTabChange = (t: Tab) => {
    setTab(t);
    setMode('login');
    setSuccess(false);
  };

  // Reset everything on close
  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setTab('Student');
      setMode('login');
      setSuccess(false);
    }, 300);
  };

  const handleSuccess = useCallback(() => {
    setSuccess(true);
    setTimeout(() => {
      handleClose();
    }, 4000);
  }, []);

  // Reset success when mode changes
  const handleModeChange = (m: Mode) => {
    setMode(m);
    setSuccess(false);
  };

  const scrollbarStyle = `
    .modal-scroll::-webkit-scrollbar { width: 3px; }
    .modal-scroll::-webkit-scrollbar-track { background: transparent; }
    .modal-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
    .modal-scroll { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent; }
  `;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <style>{scrollbarStyle}</style>
          <div style={{ position: 'fixed', inset: 0, zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              onClick={e => e.stopPropagation()}
              className="glass"
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '460px',
                maxHeight: '88vh',
                borderRadius: '24px',
                boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 60px rgba(0,212,255,0.06)',
                cursor: 'default',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Close button */}
              <button
                onClick={handleClose}
                style={{
                  position: 'absolute', top: '18px', right: '20px', zIndex: 10,
                  background: 'transparent', border: 'none', color: 'var(--text2)',
                  fontSize: '1.1rem', cursor: 'none', padding: '4px', lineHeight: 1,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text2)'}
              >✕</button>

              {/* Sticky header */}
              {!success && (
                <div style={{ padding: '28px 28px 0', flexShrink: 0, position: 'sticky', top: 0, zIndex: 5 }}>
                  {/* Tab switcher */}
                  <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px', marginBottom: '20px', border: '1px solid var(--border)' }}>
                    {(['Student', 'Runner', 'Vendor'] as Tab[]).map(tt => (
                      <button
                        key={tt}
                        onClick={() => handleTabChange(tt)}
                        style={{
                          flex: 1, padding: '8px 0', fontSize: '0.8rem', fontWeight: 500,
                          borderRadius: '8px', cursor: 'none', border: 'none', transition: 'all 0.2s',
                          fontFamily: "'Instrument Sans', sans-serif",
                          background: tab === tt ? 'rgba(255,255,255,0.1)' : 'transparent',
                          color: tab === tt ? 'var(--text)' : 'var(--text3)',
                          boxShadow: tab === tt ? '0 2px 10px rgba(0,0,0,0.2)' : 'none',
                        }}
                      >
                        {tt}
                      </button>
                    ))}
                  </div>

                  {/* Login / Sign Up toggle */}
                  <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: '100px', padding: '3px', marginBottom: '24px', border: '1px solid var(--border2)', width: 'fit-content' }}>
                    {(['login', 'signup'] as Mode[]).map(m => (
                      <button
                        key={m}
                        onClick={() => handleModeChange(m)}
                        style={{
                          padding: '7px 20px', fontSize: '0.8rem', fontWeight: 500,
                          borderRadius: '100px', cursor: 'none', border: 'none', transition: 'all 0.2s',
                          fontFamily: "'Instrument Sans', sans-serif",
                          background: mode === m ? 'var(--accent)' : 'transparent',
                          color: mode === m ? '#000' : 'var(--text3)',
                        }}
                      >
                        {m === 'login' ? 'Log In' : 'Sign Up'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Scrollable body */}
              <div
                className="modal-scroll"
                style={{ position: 'relative', overflowY: 'auto', padding: success ? '0' : '0 28px 28px', flexGrow: 1 }}
              >
                <AnimatePresence mode="wait">
                  {success ? (
                    <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                      <SuccessState />
                    </motion.div>
                  ) : mode === 'login' ? (
                    <motion.div key={`login-${tab}`} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.18 }}>
                      <LoginForm tab={tab} />
                    </motion.div>
                  ) : tab === 'Vendor' ? (
                    <motion.div key="vendor-signup" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.18 }}>
                      <VendorSignup onSuccess={handleSuccess} />
                    </motion.div>
                  ) : (
                    <motion.div key={`${tab}-signup`} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.18 }}>
                      <StudentRunnerSignup isRunner={tab === 'Runner'} onSuccess={handleSuccess} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
