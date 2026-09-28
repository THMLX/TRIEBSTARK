// Apply the saved choice before CSS paints; first-time visitors always get dark mode.
(() => {
  'use strict';
  let theme = 'dark';
  try {
    const saved = window.localStorage.getItem('triebstark-theme');
    if (saved === 'light' || saved === 'dark') theme = saved;
  } catch { /* Storage can be disabled; dark mode remains the default. */ }
  document.documentElement.dataset.theme = theme;
  try { document.documentElement.lang = window.localStorage.getItem('triebstark-language') === 'nb' ? 'nb' : 'en'; }
  catch { document.documentElement.lang = 'en'; }
  const color = document.querySelector('meta[name="theme-color"]');
  if (color) color.content = theme === 'dark' ? '#1c201c' : '#f3f0e9';
})();
