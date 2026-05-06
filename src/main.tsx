import React, { StrictMode, Suspense, Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { FirebaseProvider } from './contexts/FirebaseContext.tsx';
import { Web3Provider } from './contexts/Web3Context.tsx';

console.log('Dgamers Initializing...');

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-red-500 p-8 font-mono flex flex-col items-center justify-center">
          <h1 className="text-2xl mb-4 font-bold">Critical Application Error</h1>
          <pre className="bg-zinc-900 p-4 rounded text-xs overflow-auto max-w-full">
            {this.state.error?.message}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-primary text-white px-4 py-2 rounded font-bold"
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center font-bold text-zinc-500 uppercase tracking-widest font-mono">SYSTEM BOOTING...</div>}>
          <Web3Provider>
            <FirebaseProvider>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </FirebaseProvider>
          </Web3Provider>
        </Suspense>
      </ErrorBoundary>
    </StrictMode>,
  );
} else {
  console.error('Root element not found');
}
