// MUST BE FIRST: Aggressive SES warning suppression (including browser extensions)
(function() {
  const originalWarn = console.warn;
  const originalLog = console.log;
  const originalError = console.error;
  const originalInfo = console.info;

  const suppressPatterns = [
    'mathTaming', 'SES', 'lockdown-install', 'lockdown-run',
    'deprecated and does nothing', 'Removing intrinsics', 'moz-extension',
    'toTemporalInstant', 'unpermitted intrinsics'
  ];

  function shouldSuppress(message: any): boolean {
    const messageStr = String(message || '');
    return suppressPatterns.some(pattern => messageStr.includes(pattern));
  }

  // Override all console methods
  console.warn = function(...args: any[]) {
    if (!shouldSuppress(args[0])) originalWarn.apply(console, args);
  };
  console.log = function(...args: any[]) {
    if (!shouldSuppress(args[0])) originalLog.apply(console, args);
  };
  console.error = function(...args: any[]) {
    if (!shouldSuppress(args[0])) originalError.apply(console, args);
  };
  console.info = function(...args: any[]) {
    if (!shouldSuppress(args[0])) originalInfo.apply(console, args);
  };

  // Suppress at window level for extension-generated warnings
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      if (shouldSuppress(event.message) || shouldSuppress(event.filename)) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    }, true);

    // Detect and warn about problematic extensions
    setTimeout(() => {
      const hasExtensionWarnings = document.querySelectorAll('script[src*="moz-extension"]').length > 0;
      if (hasExtensionWarnings) {
        console.info('🔧 Browser extension detected that may generate SES warnings. These are suppressed automatically.');
      }
    }, 1000);
  }
})();

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationsProvider } from './contexts/NotificationsContext'
import './index.css'
import App from './App.tsx'

// Additional SES warning suppression
const originalWarn = console.warn;
const originalLog = console.log;
const originalError = console.error;

console.warn = (...args: any[]) => {
  const message = String(args[0] || '');
  if (message.includes('mathTaming') ||
      message.includes('nullish') ||
      message.includes('SES') ||
      message.includes('lockdown-install') ||
      message.includes('deprecated and does nothing') ||
      message.includes('lockdown-install.js')) {
    return; // Suppress these specific warnings
  }
  originalWarn.apply(console, args);
};

console.log = (...args: any[]) => {
  const message = String(args[0] || '');
  if (message.includes('SES') ||
      message.includes('lockdown-install') ||
      message.includes('Removing intrinsics')) {
    return; // Suppress these specific logs
  }
  originalLog.apply(console, args);
};

console.error = (...args: any[]) => {
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
