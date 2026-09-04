(function () {
    const KEY = 'navarre-talks-theme';
    const root = document.documentElement;
    const btn = document.querySelector('.theme-toggle');
  
    function current() {
      return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }
  
    function apply(theme) {
      if (theme === 'dark') root.setAttribute('data-theme', 'dark');
      else root.removeAttribute('data-theme');
      try { localStorage.setItem(KEY, theme); } catch (e) {}
      if (btn) btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    }
  
    apply(current());
  
    if (btn) {
      btn.addEventListener('click', function () {
        apply(current() === 'dark' ? 'light' : 'dark');
      });
    }
  })();