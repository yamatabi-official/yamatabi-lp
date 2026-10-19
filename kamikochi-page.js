(() => {
  const video = document.querySelector('[data-replay-video]');
  const play = document.querySelector('[data-river-play]');
  if (video && play) {
    play.hidden = false;
    const status = document.querySelector('[data-river-status]');
    function sync() { play.textContent = video.paused ? '流れを眺める ▶' : '立ち止まる ⏸'; }
    play.addEventListener('click', () => {
      if (!video.paused) { video.pause(); return; }
      document.querySelectorAll('video,audio').forEach(other => { if (other !== video) other.pause(); });
      video.muted = true;
      if (!video.hasAttribute('src')) video.src = 'assets/kamikochi-river-intro.mp4?v=full-film';
      video.play()?.catch(() => { status.textContent = '再生できませんでした。写真のまま眺めるか、動画の再生ボタンからお試しください。'; });
    });
    video.addEventListener('play', () => { document.querySelectorAll('video,audio').forEach(other => { if (other !== video) other.pause(); }); sync(); });
    video.addEventListener('pause', sync);
    video.addEventListener('error', () => { status.textContent = '動画を読み込めませんでした。写真の風景はそのまま楽しめます。'; });
    document.querySelector('#replay-river').addEventListener('toggle', event => { if (!event.target.open) video.pause(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); });
    window.addEventListener('pagehide', () => video.pause());
    if ('IntersectionObserver' in window) new IntersectionObserver(entries => { if (!entries[0].isIntersecting) video.pause(); }, { threshold: 0 }).observe(video);
  }
  const trees = document.querySelector('[data-tree-toggle]');
  if (trees) {
    trees.hidden = false;
    trees.addEventListener('click', () => {
      const selected = trees.getAttribute('aria-pressed') !== 'true';
      trees.setAttribute('aria-pressed', String(selected));
      trees.textContent = selected ? '全体の眺めに戻す' : '木々を大きく見る';
      document.querySelector('[data-tree-view]').classList.toggle('is-close', selected);
    });
  }
  // Preserve existing shared companion links without adding personal fields to the URL.
  const day = new URL(location.href).searchParams.get('day');
  if (['solo', 'together', 'friends'].includes(day)) document.querySelectorAll('[data-plan-link]').forEach(link => {
    const url = new URL(link.href); url.searchParams.set('day', day); link.href = url.href;
  });
})();
