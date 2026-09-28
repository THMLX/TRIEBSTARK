(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const t = (text, variables) => window.siteI18n ? window.siteI18n.t(text, variables) : text.replace(/\{(\w+)\}/g, (_, key) => variables?.[key] ?? '');
  const themeButton = document.querySelector('.theme-toggle');
  const themeColor = document.querySelector('meta[name="theme-color"]');
  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    if (themeColor) themeColor.content = theme === 'dark' ? '#1c201c' : '#f3f0e9';
    if (!themeButton) return;
    const label = t(theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    themeButton.setAttribute('aria-label', label);
    themeButton.title = label;
    themeButton.querySelector('.theme-label').textContent = t(theme === 'dark' ? 'Light mode' : 'Dark mode');
  }
  if (themeButton) {
    applyTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
    themeButton.addEventListener('click', () => {
      const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      applyTheme(theme);
      try { window.localStorage.setItem('triebstark-theme', theme); }
      catch { /* The toggle still works when browser storage is unavailable. */ }
    });
    themeButton.hidden = false;
    window.addEventListener('storage', (event) => {
      if (event.key === 'triebstark-theme' || event.key === null) {
        applyTheme(event.newValue === 'light' ? 'light' : 'dark');
      }
    });
  }

  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#navigation');
  function closeMenu(returnFocus = false) {
    if (!menuButton || !navigation) return;
    navigation.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.querySelector('span').textContent = '＋';
    if (returnFocus) menuButton.focus();
  }
  if (menuButton && navigation) {
    menuButton.addEventListener('click', () => {
      const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
      navigation.classList.toggle('is-open', !isOpen);
      menuButton.setAttribute('aria-expanded', String(!isOpen));
      menuButton.querySelector('span').textContent = isOpen ? '＋' : '−';
    });
    navigation.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeMenu();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') closeMenu(true);
    });
    document.addEventListener('click', (event) => {
      if (!event.target.closest('.site-header')) closeMenu();
    });
    window.matchMedia('(min-width: 961px)').addEventListener('change', () => closeMenu());
  }
  let toastTimer;
  let toastMessage = null;
  function renderToast() {
    const toast = document.querySelector('.toast');
    if (toast && toastMessage) toast.textContent = t(toastMessage.text, toastMessage.variables);
  }
  window.addEventListener('site:languagechange', () => {
    applyTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
    renderToast();
  });
  document.querySelectorAll('[data-copy-link], [data-copy-value]').forEach((button) => {
    button.hidden = false;
    button.addEventListener('click', async () => {
      const toast = document.querySelector('.toast');
      if (!toast) return;
      const value = button.dataset.copyValue || 'https://triebstark.com/';
      const label = button.dataset.copyLabel;
      try {
        if (!navigator.clipboard) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(value);
        toastMessage = { text: label ? '{label} username copied.' : 'Site link copied.', variables: { label } };
      } catch {
        toastMessage = { text: label ? '{label}: {value}' : 'Site address: {value}', variables: { label, value } };
      }
      renderToast();
      clearTimeout(toastTimer);
      toast.classList.add('is-visible');
      toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 4500);
    });
  });
})();
