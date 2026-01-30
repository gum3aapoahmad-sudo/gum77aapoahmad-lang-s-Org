import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const startApp = () => {
  const container = document.getElementById('root');
  if (!container) {
    console.error("Root element not found");
    return;
  }

  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Failed to render the app:', error);
    container.innerHTML = `
      <div style="display:flex; justify-content:center; align-items:center; height:100vh; color:#C5A059; font-family:sans-serif; text-align:center; padding:20px; background:#fff;">
        <div>
          <h2>عذراً، حدث خطأ أثناء تشغيل أمنة</h2>
          <p>يرجى تحديث الصفحة أو المحاولة لاحقاً.</p>
        </div>
      </div>`;
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
