// Inject sidebar, theme toggle, scrollspy, reveal-on-scroll, and page-link highlighting
(async () => {
  // 1) Sidebar inject
  const mount = document.createElement('div');
  mount.id = '___sidebar';
  document.body.appendChild(mount);
  try {
    const res = await fetch('/partials/sidebar.html');
    mount.outerHTML = await res.text();
  } catch(e){ console.warn('sidebar inject failed', e); }

  // 2) Theme bootstrap
  const root = document.documentElement;
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.setAttribute('data-theme', stored || (prefersDark ? 'dark' : 'light'));
  window.toggleTheme = () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next); localStorage.setItem('theme', next);
  };

  // 3) Highlight current page in sidebar when loaded
  const markActive = () => {
    const cur = location.pathname.replace(/\/$/, '') || '/';
    document.querySelectorAll('.sidebar a.nav').forEach(a => {
      const path = (a.getAttribute('href') || '').replace(/\/$/, '') || '/';
      if (path === cur) a.classList.add('active');
    });
  };
  document.addEventListener('readystatechange', markActive);
  markActive();

  // 4) ScrollSpy for same-page sections (Home)
  const anchors = [...document.querySelectorAll('.sidebar a.nav[data-spy]')];
  if (anchors.length) {
    const map = new Map(anchors.map(a => [a.getAttribute('href'), a]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        const id = '#' + e.target.id;
        const link = map.get(id);
        if (!link) return;
        if (e.isIntersecting) {
          anchors.forEach(x => x.classList.remove('active'));
          link.classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });
    document.querySelectorAll('section[id]').forEach(sec => io.observe(sec));
  }

  // 5) Reveal on scroll (reusable)
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced) {
    const reveal = document.querySelectorAll('.fade');
    const io2 = new IntersectionObserver((ents) => {
      ents.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });
    reveal.forEach(el => io2.observe(el));
  }
})();