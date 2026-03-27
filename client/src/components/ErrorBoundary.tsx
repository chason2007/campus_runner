import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: '#080808', 
          color: '#fff', 
          textAlign: 'center', 
          padding: '20px',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '10px', color: '#00d4ff' }}>Bummer!</h1>
          <p style={{ opacity: 0.7, marginBottom: '24px' }}>Something went sideways in the app layout.</p>
          <div style={{ padding: '16px', background: '#111', borderRadius: '12px', border: '1px solid #222', maxWidth: '400px', width: '100%', marginBottom: '24px' }}>
             <code style={{ fontSize: '0.8rem', color: '#ff6b6b' }}>{this.state.error?.message}</code>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            style={{ 
              padding: '12px 24px', 
              background: '#00d4ff', 
              color: '#000', 
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: 'bold', 
              cursor: 'pointer' 
            }}
          >
            REFRESH APP
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
