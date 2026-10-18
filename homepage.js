/* One-time entrances only. No scroll loop, key-visual transform or external library. */
(() => {
  const sections = [...document.querySelectorAll('.brand-home [data-reveal]')];
  const animated = [...document.querySelectorAll('.brand-home [data-motion]')];
  const targets = [...sections, ...animated];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let observer;
  const show = node => {
    if (node.hasAttribute('data-reveal')) node.classList.add('reveal-visible');
    if (node.hasAttribute('data-motion')) node.classList.add('motion-play');
    observer?.unobserve(node);
  };
  const showAll = () => {
    observer?.disconnect();
    sections.forEach(node => node.classList.remove('reveal-ready'));
    animated.forEach(node => node.classList.remove('motion-play'));
  };
  if (motion.matches || !('IntersectionObserver' in window)) return;
  try {
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) show(entry.target);
      });
    }, { rootMargin: '0px 0px 36px 0px', threshold: 0.05 });
    sections.forEach(node => {
      node.classList.add('reveal-ready');
    });
    targets.forEach(node => observer.observe(node));
    // Keyboard focus and in-page links must never lead into invisible content.
    document.addEventListener('focusin', event => {
      const section = event.target.closest('[data-reveal], [data-motion]');
      if (section) show(section);
    });
    motion.addEventListener('change', event => {
      if (event.matches) showAll();
    });
    window.addEventListener('beforeprint', showAll);
  } catch {
    showAll();
  }
})();
