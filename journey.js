(() => {
  const section = document.querySelector('#your-day');
  if (!section) return;
  const plans = {
    solo: { title: '川の音に、耳を澄ます休日。', copy: '河童橋で景色を眺めたら、開放されている梓川沿いの遊歩道へ。写真を撮る手を少し休めて、水の色や風に目を向けてみる。', hint: '予定を詰めず、ひと休みの時間も旅の一部に。' },
    together: { title: '大切な人と、ゆっくり話す休日。', copy: '河童橋で同じ景色を眺めて、梓川沿いをゆっくり歩く。いつもの街から離れて、話したかったことや、何でもない話を。', hint: '歩く範囲や休憩は、お互いのペースに合わせて。' },
    friends: { title: '友達と、景色を分かち合う休日。', copy: '河童橋で山々を見上げて、開放されている遊歩道を散策。それぞれが見つけた景色を写真に残し、あとで見せ合うのも楽しみのひとつ。', hint: '写真は周囲の通行を妨げず、みんなが無理なく戻れる予定に。' }
  };
  const key = 'yamatabi-kamikochi-day-v1';
  const choices = section.querySelector('#day-choices');
  const checks = [...section.querySelectorAll('.day-checks input')];
  const status = section.querySelector('#day-status');
  let saved = {};
  let storageOK = true;
  try { saved = JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch { storageOK = false; }
  const shared = new URL(location.href).searchParams.get('day');
  let selection = Object.hasOwn(plans, shared) ? shared : Object.hasOwn(plans, saved.day) ? saved.day : 'solo';
  function render() {
    const plan = plans[selection];
    section.querySelector('#day-plan-title').textContent = plan.title;
    section.querySelector('#day-plan-copy').textContent = plan.copy;
    section.querySelector('#day-plan-hint').textContent = plan.hint;
    choices.querySelector(`input[value="${selection}"]`).checked = true;
  }
  const note = section.querySelector('#day-storage-note');
  function storageNote() {
    note.textContent = storageOK ? '選択とチェックは、このブラウザ内に保存されます。アプリや端末を変えると引き継がれない場合があります。' : 'このブラウザでは記録を保存できません。準備リストをダウンロードして残せます。';
  }
  function remember() {
    try { localStorage.setItem(key, JSON.stringify({ day: selection, checks: checks.filter(c => c.checked).map(c => c.value) })); }
    catch { storageOK = false; storageNote(); }
  }
  checks.forEach(c => { c.checked = Array.isArray(saved.checks) && saved.checks.includes(c.value); c.addEventListener('change', remember); });
  choices.addEventListener('change', e => {
    if (!Object.hasOwn(plans, e.target.value)) return;
    selection = e.target.value;
    render(); remember();
    try {
      const url = new URL(location.href);
      url.searchParams.set('day', selection);
      history.replaceState(history.state, '', url);
    } catch { /* Selection and sharing still work if URL replacement is unavailable. */ }
    status.textContent = `「${plans[selection].title}」に切り替えました。`;
    section.querySelector('#day-copy-fallback').hidden = true;
  });
  function planURL() {
    const url = new URL('experience.html', location.href);
    url.searchParams.set('day', selection);
    url.hash = 'your-day';
    return url.href;
  }
  section.querySelector('#day-share').addEventListener('click', async () => {
    const url = planURL();
    const data = { title: `YAMATABI｜${plans[selection].title}`, text: '次の休日、上高地へ。こんな一日を過ごしてみませんか。', url };
    try {
      if (navigator.share) { await navigator.share(data); status.textContent = '共有画面を閉じました。'; return; }
      if (!navigator.clipboard?.writeText) throw new Error('no clipboard');
      await navigator.clipboard.writeText(url);
      status.textContent = '選んだ休日プランのリンクをコピーしました。';
    } catch (error) {
      if (error.name === 'AbortError') { status.textContent = '共有をキャンセルしました。'; return; }
      section.querySelector('#day-copy-fallback').hidden = false;
      const input = section.querySelector('#day-copy-url');
      input.value = url; input.focus(); input.select();
      status.textContent = '下のリンクをコピーして共有できます。';
    }
  });
  section.querySelector('#day-download').addEventListener('click', () => {
    const plan = plans[selection];
    const text = ['YAMATABI｜上高地での休日', plan.title, plan.copy, plan.hint, '', '旅の準備', ...checks.map(c => `${c.checked ? '[済]' : '[ ]'} ${c.parentElement.textContent.trim()}`), '', '過ごし方の提案です。所要時間・費用・運行・通行状況は公式案内で確認してください。', '上高地公式：https://www.kamikochi.or.jp/', '交通案内：https://www.alpico.co.jp/traffic/local/kamikochi/', '', planURL()].join('\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF', text], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'YAMATABI-kamikochi-checklist.txt';
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    status.textContent = '準備リストの保存を開始しました。アプリ内で保存できない場合は、ブラウザで開くか、このページを共有して残してください。';
  });
  render(); storageNote();
  choices.hidden = false;
  section.querySelector('#day-tools').hidden = false;
})();
