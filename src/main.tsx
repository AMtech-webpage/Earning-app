import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('NovaRewards Initializing...');

const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  try {
    return <>{children}</>;
  } catch (e) {
    console.error('App Render Error:', e);
    return <div className="p-12 text-red-500 font-mono">Critical Render Error. Check Console.</div>;
  }
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
          <App />
        </Suspense>
      </ErrorBoundary>
    </StrictMode>,
  );
} else {
  console.error('Root element not found');
}
