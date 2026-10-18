(() => {
  const room = document.querySelector('#quiet-room');
  if (!room || typeof room.showModal !== 'function') return;
  const $ = selector => room.querySelector(selector);
  const film = $('#quiet-film');
  const river = $('.quiet-river');
  const sky = $('.quiet-sky');
  const stage = $('#quiet-film-stage');
  const ready = $('#quiet-ready');
  const rest = $('#quiet-rest');
  const invitation = $('#quiet-invitation');
  const pause = $('#quiet-pause');
  const display = $('#quiet-display');
  const status = $('#quiet-status');
  const saveNote = $('#quiet-save-note');
  const entrySaved = document.querySelector('#quiet-entry-saved');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const key = 'yamatabi-quiet-time-v1';
  let saved = false;
  let scene = 'river';
  let mode = 'ready';
  let previousFocus;
  let fadeTimer;
  let invitationTimer;
  let riverPaused = false;
  let sound = false;
  let captions = false;
  let session = 0;
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null');
    if (value?.version === 1 && ['river', 'sky'].includes(value.scene)) { saved = true; scene = value.scene; }
  } catch { /* Reading is optional; explicitly saving will explain unavailable storage. */ }
  function updateSaved() {
    entrySaved.hidden = !saved;
    $('#quiet-return-note').hidden = !saved;
    $('#quiet-save').textContent = saved ? '手元に残しました' : '手元に残す';
    saveNote.textContent = saved ? 'このブラウザ内に保存しました。同じブラウザで、このページから戻れます。' : 'この時間に、また戻れます。保存先はこのブラウザ内です。';
  }
  function persist() {
    try { localStorage.setItem(key, JSON.stringify({ version: 1, scene })); saved = true; updateSaved(); return true; }
    catch {
      saved = false; updateSaved();
      saveNote.textContent = 'このブラウザでは保存できません。ページのURLをブックマークして、またお越しください。';
      return false;
    }
  }
  function clearTimers() { clearTimeout(fadeTimer); clearTimeout(invitationTimer); }
  function discreet(value) {
    room.classList.toggle('quiet-discreet', value);
    display.setAttribute('aria-pressed', String(value));
    display.textContent = value ? '表示を戻す' : '表示を隠す';
  }
  function updatePause() {
    pause.hidden = mode === 'ready' || (mode === 'rest' && scene === 'sky');
    const media = mode === 'film' ? film : river;
    pause.textContent = media.paused ? (mode === 'film' ? '物語を再生' : '風景を再生') : '映像を止める';
  }
  function playMedia(media, message) {
    const opened = session;
    try {
      media.play()?.catch(() => {
        if (!room.open || opened !== session || (media === film ? mode !== 'film' : mode !== 'rest' || scene !== 'river')) return;
        status.textContent = message;
        updatePause();
      });
    } catch { status.textContent = message; updatePause(); }
  }
  function syncSound() {
    sound = !film.muted;
    $('#quiet-sound').setAttribute('aria-pressed', String(sound));
    $('#quiet-sound').textContent = sound ? '音を消す' : '音を聴く';
    $('#quiet-sound-choice').checked = sound;
  }
  function syncCaptions() {
    const track = film.textTracks[0];
    if (track) track.mode = captions ? 'showing' : 'disabled';
    $('#quiet-captions').setAttribute('aria-pressed', String(captions));
    $('#quiet-captions').textContent = captions ? '説明字幕を隠す' : '説明字幕を表示';
  }
  function chooseScene(value, auto = true) {
    scene = value;
    river.pause();
    river.hidden = scene !== 'river';
    sky.hidden = scene !== 'sky';
    $(`input[name="quiet-view"][value="${scene}"]`).checked = true;
    $('#quiet-scene-note').textContent = scene === 'river' ? '梓川の風景。音声なしで、ゆっくり。' : '空の写真を眺める時間。音声・動きはありません。';
    if (scene === 'river' && auto && !riverPaused && !motion.matches && !navigator.connection?.saveData && !document.hidden) {
      if (!river.hasAttribute('src')) river.src = 'assets/kamikochi-river-intro.mp4?v=full-film';
      playMedia(river, '写真のままでも過ごせます。動かしたいときは「風景を再生」から。');
    }
    updatePause();
  }
  function enterRest(withPause = true) {
    if (!room.open) return;
    clearTimers();
    film.pause();
    film.muted = true;
    mode = 'rest'; room.dataset.mode = mode;
    ready.hidden = true; rest.hidden = false; display.hidden = false;
    discreet(false);
    status.textContent = '';
    invitation.hidden = true;
    $('#quiet-invitation-title').textContent = 'あなたも、ひとくち。';
    $('#quiet-invitation-copy').replaceChildren(document.createTextNode('手元に飲み物があれば、ご一緒に。なくても、ただ眺めるだけで。'));
    $('.quiet-invitation-actions').hidden = false;
    chooseScene(scene);
    if (!stage.hidden) {
      stage.classList.add('fading');
      if (stage.contains(document.activeElement)) display.focus({ preventScroll: true });
      fadeTimer = setTimeout(() => { stage.hidden = true; }, motion.matches ? 0 : 1250);
    }
    invitationTimer = setTimeout(() => {
      if (room.open && mode === 'rest') invitation.hidden = false;
    }, withPause && !motion.matches ? 1700 : 0);
  }
  function startFilm() {
    if (!room.open) return;
    clearTimers();
    river.pause();
    mode = 'film'; room.dataset.mode = mode;
    ready.hidden = true; rest.hidden = true; display.hidden = true; discreet(false);
    stage.hidden = false; stage.classList.remove('fading');
    status.textContent = '';
    sound = $('#quiet-sound-choice').checked;
    film.muted = !sound;
    if (!film.hasAttribute('src')) film.src = 'kamikochi-film.mp4';
    else film.currentTime = 0;
    syncCaptions(); syncSound();
    playMedia(film, '自動では再生できませんでした。「物語を再生」か動画の再生ボタンからご覧ください。');
    pause.hidden = false;
    pause.focus({ preventScroll: true });
    updatePause();
  }
  function openRoom(request = 'story') {
    if (room.open) return;
    previousFocus = document.activeElement;
    document.querySelectorAll('video,audio').forEach(media => media.pause());
    clearTimers(); session++;
    mode = 'ready'; room.dataset.mode = mode;
    ready.hidden = false; rest.hidden = true; stage.hidden = true;
    stage.classList.remove('fading'); display.hidden = true; pause.hidden = true;
    river.hidden = true; sky.hidden = true; riverPaused = false; status.textContent = '';
    discreet(false); updateSaved();
    sound = false; film.muted = true; $('#quiet-sound-choice').checked = false; syncSound();
    document.body.classList.add('quiet-open');
    room.showModal();
    if (request === 'rest') { enterRest(false); display.focus({ preventScroll: true }); }
    else $('#quiet-start').focus({ preventScroll: true });
  }
  function cleanup() {
    clearTimers(); session++;
    for (const media of [film, river]) {
      media.pause(); media.removeAttribute('src'); media.load();
    }
    document.body.classList.remove('quiet-open');
    previousFocus?.focus({ preventScroll: true });
  }
  function closeRoom() { if (room.open) room.close(); }
  document.querySelectorAll('[data-quiet-open]').forEach(link => {
    link.hidden = false;
    link.addEventListener('click', event => { event.preventDefault(); openRoom(link.dataset.quietOpen); });
  });
  $('#quiet-close').addEventListener('click', closeRoom);
  room.addEventListener('close', cleanup);
  room.addEventListener('cancel', event => { event.preventDefault(); closeRoom(); });
  $('#quiet-start').addEventListener('click', startFilm);
  $('#quiet-start-rest').addEventListener('click', () => { enterRest(false); display.focus({ preventScroll: true }); });
  $('#quiet-to-rest').addEventListener('click', () => enterRest());
  $('#quiet-rewatch').addEventListener('click', () => {
    // Ask for sound explicitly again rather than unexpectedly starting audio.
    clearTimers(); river.pause(); mode = 'ready'; room.dataset.mode = mode;
    ready.hidden = false; rest.hidden = true; stage.hidden = true;
    pause.hidden = true; display.hidden = true; discreet(false); status.textContent = '';
    $('#quiet-start').focus({ preventScroll: true });
  });
  film.addEventListener('ended', () => { if (room.open && mode === 'film') enterRest(); });
  film.addEventListener('volumechange', syncSound);
  film.addEventListener('loadedmetadata', syncCaptions);
  film.textTracks.addEventListener('change', () => {
    captions = film.textTracks[0]?.mode === 'showing';
    $('#quiet-captions').setAttribute('aria-pressed', String(captions));
    $('#quiet-captions').textContent = captions ? '説明字幕を隠す' : '説明字幕を表示';
  });
  film.addEventListener('error', () => { if (room.open && mode === 'film') status.textContent = '作品を読み込めませんでした。余韻へ進むか、閉じて通常の作品ページからご覧いただけます。'; });
  river.addEventListener('error', () => { if (room.open && mode === 'rest') { river.pause(); river.hidden = true; status.textContent = '風景の動画を読み込めませんでした。写真のまま、ゆっくり過ごせます。'; updatePause(); } });
  for (const media of [film, river]) for (const type of ['play', 'pause']) media.addEventListener(type, updatePause);
  $('#quiet-sound').addEventListener('click', () => { film.muted = !film.muted; syncSound(); });
  $('#quiet-captions').addEventListener('click', () => { captions = !captions; syncCaptions(); });
  $('track').addEventListener('error', () => { if (room.open) status.textContent = '説明字幕を読み込めませんでした。作品の画面内にも文字が表示されます。'; });
  pause.addEventListener('click', () => {
    const media = mode === 'film' ? film : river;
    if (media.paused) {
      if (mode === 'rest') {
        riverPaused = false; river.hidden = false;
        if (!river.hasAttribute('src')) river.src = 'assets/kamikochi-river-intro.mp4?v=full-film';
      }
      status.textContent = '';
      playMedia(media, '再生できませんでした。写真のまま過ごすか、閉じて戻れます。');
    } else { media.pause(); if (mode === 'rest') riverPaused = true; }
    updatePause();
  });
  display.addEventListener('click', () => discreet(!room.classList.contains('quiet-discreet')));
  $('#quiet-settle').addEventListener('click', () => {
    $('#quiet-invitation-title').textContent = '今は、このままで。';
    $('#quiet-invitation-copy').textContent = '飲み物をひとくち。窓の外を見る。楽な姿勢で、画面から目を離しても。';
    $('.quiet-invitation-actions').hidden = true;
    display.focus({ preventScroll: true });
  });
  $('#quiet-watch').addEventListener('click', () => { discreet(true); display.focus({ preventScroll: true }); });
  room.querySelectorAll('input[name="quiet-view"]').forEach(input => input.addEventListener('change', () => {
    chooseScene(input.value);
    status.textContent = '';
    if (saved) persist();
  }));
  $('#quiet-save').addEventListener('click', () => { persist(); });
  function stopForBackground() {
    if (!room.open) return;
    film.pause(); river.pause(); riverPaused = true; updatePause();
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopForBackground(); });
  window.addEventListener('pagehide', () => { if (room.open) { stopForBackground(); closeRoom(); } });
  motion.addEventListener('change', () => { if (room.open && mode === 'rest' && motion.matches) { river.pause(); riverPaused = true; updatePause(); } });
  const inline = document.querySelector('#scene .video-frame video');
  inline?.addEventListener('ended', () => { document.querySelector('.quiet-inline-invite').hidden = false; });
  updateSaved();
})();
