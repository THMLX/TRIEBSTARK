(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const themeButton = document.querySelector('.theme-toggle');
  const themeColor = document.querySelector('meta[name="theme-color"]');
  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    if (themeColor) themeColor.content = theme === 'dark' ? '#1c201c' : '#f3f0e9';
    if (!themeButton) return;
    const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    themeButton.setAttribute('aria-label', label);
    themeButton.title = label;
    themeButton.querySelector('.theme-label').textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
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
    window.matchMedia('(min-width: 781px)').addEventListener('change', () => closeMenu());
  }
  let toastTimer;
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
        toast.textContent = label ? `${label} username copied.` : 'Site link copied.';
      } catch {
        toast.textContent = label ? `${label}: ${value}` : `Site address: ${value}`;
      }
      clearTimeout(toastTimer);
      toast.classList.add('is-visible');
      toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 4500);
    });
  });
})();
