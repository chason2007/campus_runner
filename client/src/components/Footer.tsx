export default function Footer() {
  return (
    <footer className="lp-footer">
      <div className="container">
        <div className="ft-top">
          <div className="logo" style={{ fontSize: '1.15rem' }}>
            <img src="/logo.png" alt="Campus Runner Logo" style={{ width: 24, height: 24, objectFit: 'contain' }} />
            Campus Runner
          </div>
          <div className="ft-tagline">Delivered by students, for students.</div>
        </div>

        <div className="ft-bot">
          <div className="ft-copy">© 2025 Campus Runner. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}
