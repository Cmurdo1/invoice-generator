import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationsProvider } from './contexts/NotificationsContext'
import './index.css'
import App from './App.tsx'

// Suppress SES warnings from Cloudflare Workers runtime
const originalWarn = console.warn;
const originalLog = console.log;
const originalError = console.error;

console.warn = (...args) => {
  const message = String(args[0] || '');
  if (message.includes('dateTaming') ||
      message.includes('nullish') ||
      message.includes('SES') ||
      message.includes('lockdown-install')) {
    return; // Suppress these specific warnings
  }
  originalWarn.apply(console, args);
};

console.log = (...args) => {
  const message = String(args[0] || '');
  if (message.includes('SES') ||
      message.includes('lockdown-install') ||
      message.includes('Removing intrinsics')) {
    return; // Suppress these specific logs
  }
  originalLog.apply(console, args);
};

console.error = (...args) => {
  const message = String(args[0] || '');
  if (message.includes('SES') ||
      message.includes('lockdown-install')) {
    return; // Suppress these specific errors
  }
  originalError.apply(console, args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <NotificationsProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </NotificationsProvider>
    </ErrorBoundary>
  </StrictMode>,
)
