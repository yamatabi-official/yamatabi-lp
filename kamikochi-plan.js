(() => {
  const form = document.querySelector('#trip-plan-form');
  if (!form) return;
  const key = 'yamatabi-kamikochi-plan-v1';
  const $ = id => document.getElementById(id);
  const companies = {unknown: 'まだ決めていない', solo: 'ひとりで', together: '大切な人と', friends: '友達と'};
  const transports = {unknown: 'まだ決めていない', public: '公共交通', car: '車＋現地で乗り換え'};
  const checks = [...form.querySelectorAll('input[name="check"]')];
  let lastPlan = null;
  let stored = false;
  function valid(p) {
    return p?.version === 1 && typeof p.origin === 'string' && p.origin.length > 0 && p.origin.length <= 80 &&
      typeof p.date === 'string' && (p.date === '' || /^\d{4}-\d{2}-\d{2}$/.test(p.date)) && Object.hasOwn(companies, p.company) && Object.hasOwn(transports, p.transport) && Array.isArray(p.checks);
  }
  function populate(p) {
    $('plan-origin').value = p.origin; $('plan-date').value = p.date; $('plan-company').value = p.company; $('plan-transport').value = p.transport;
    checks.forEach(c => { c.checked = p.checks.includes(c.value); });
  }
  function render(p) {
    lastPlan = p;
    $('plan-result-title').textContent = stored ? '手元に残した計画' : '入力した計画（未保存）';
    const summary = $('plan-summary'); summary.replaceChildren();
    for (const [term, value] of [['出発地', p.origin], ['訪問日', p.date || 'まだ決めていない'], ['同行者', companies[p.company]], ['交通手段', transports[p.transport]]]) {
      const item = document.createElement('div'), dt = document.createElement('dt'), dd = document.createElement('dd');
      dt.textContent = term; dd.textContent = value; item.append(dt, dd); summary.append(item);
    }
    const month = p.date ? Number(p.date.slice(5,7)) : 0;
    $('plan-season-note').textContent = month && [11,12,1,2,3,4].includes(month) ? '積雪や冬季閉鎖のある時期に重なる可能性があります。保存は訪問可能という判定ではありません。この通常期の案を使えるか、利用日の開放・交通・道の状況を確認してください。' : '日程の保存は訪問可能という判定ではありません。無雪・凍結なしの通常期に、この案を使えるか公式の開放・交通案内で確認してください。';
    $('plan-transport-note').textContent = p.transport === 'car' ? '車は上高地へ乗り入れできません。沢渡または平湯あかんだな方面の駐車場と、現地往復のバス・タクシーを別に確認。駐車料・燃料・高速料金も予算に含めます。' : p.transport === 'public' ? '松本・新島々経由や直行便などの候補から、出発地と日程に合う経路を確認。鉄道・高速バス・現地バスの往復分と、便ごとの予約条件を調べます。' : 'まず公共交通か、車と現地乗り換えかを選びます。出発地からの経路、現地往復の便、予約・費用はまだ確定していません。';
    $('plan-result').hidden = false; $('plan-delete').hidden = !stored; $('plan-download').disabled = false;
  }
  try {
    const p = JSON.parse(localStorage.getItem(key) || 'null');
    if (valid(p)) { stored = true; populate(p); render(p); $('plan-status').textContent = 'このブラウザに保存した計画を読み込みました。'; }
    else {
      const old = JSON.parse(localStorage.getItem('yamatabi-kamikochi-day-v1') || 'null');
      if (old && Object.hasOwn(companies, old.day)) $('plan-company').value = old.day;
      if (Array.isArray(old?.checks)) checks.forEach(c => { c.checked = old.checks.includes(c.value); });
    }
  } catch { $('plan-status').textContent = 'ブラウザ内の記録を読み込めませんでした。条件の入力とテキスト保存は利用できます。'; }
  const day = new URL(location.href).searchParams.get('day');
  if (!stored && Object.hasOwn(companies, day)) $('plan-company').value = day;
  form.addEventListener('submit', event => {
    event.preventDefault();
    const origin = $('plan-origin').value.trim();
    if (!origin) { $('plan-origin').setCustomValidity('出発地を入力してください。未定の場合は「未定」と記入できます。'); $('plan-origin').reportValidity(); return; }
    $('plan-origin').setCustomValidity('');
    const plan = {version:1,origin,date:$('plan-date').value,company:$('plan-company').value,transport:$('plan-transport').value,checks:checks.filter(c=>c.checked).map(c=>c.value)};
    try { localStorage.setItem(key, JSON.stringify(plan)); try { localStorage.removeItem('yamatabi-kamikochi-day-v1'); } catch { /* The new saved record remains valid. */ } stored = true; $('plan-status').textContent = 'このブラウザ内に計画を保存しました。予約・決済は行っていません。'; }
    catch { stored = false; $('plan-status').textContent = 'このブラウザでは保存できませんでした。入力内容は下に表示しています。テキストでダウンロードして残せます。'; }
    render(plan);
  });
  $('plan-origin').addEventListener('input', () => $('plan-origin').setCustomValidity(''));
  form.addEventListener('input', () => { if (lastPlan) { $('plan-status').textContent = '入力内容を変更しました。保存ボタンで変更を記録してください。'; $('plan-download').disabled = true; } });
  $('plan-download').addEventListener('click', () => {
    if (!lastPlan) return;
    const p = lastPlan;
    const text = ['YAMATABI｜上高地の準備メモ', '予約・決済は行っていません。', `出発地：${p.origin}`, `訪問日：${p.date || '未定'}`, `同行者：${companies[p.company]}`, `交通手段：${transports[p.transport]}`, '', '通常期・無雪凍結なしの散策案', 'ターミナル→河童橋→小梨平→河童橋周辺で休憩→ターミナル', '歩行往復約1.6km・約32分（公式区間目安の合計・休憩を除く）', '滞在2〜3時間は編集上の配分例。高低差・道の詳細・当日の開放は要確認。', '', ...checks.map(c=>`${p.checks.includes(c.value)?'[済]':'[ ]'} ${c.parentElement.textContent.trim()}`), '', '散策：https://www.kamikochi.or.jp/enjoy/walking/', '交通：https://www.alpico.co.jp/traffic/local/kamikochi/', '最新情報：https://www.kamikochi.or.jp/', '案内先確認：2026-10-19。利用日の営業・運行を確認済みではありません。'].join('\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF',text],{type:'text/plain;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download='YAMATABI-kamikochi-plan.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
    $('plan-status').textContent = 'テキスト保存を開始しました。アプリ内で保存できない場合は、通常のブラウザで開いてお試しください。';
  });
  $('plan-share').addEventListener('click', async () => {
    const url = new URL('experience.html#walk',location.href).href;
    try {
      if (navigator.share) { await navigator.share({title:'YAMATABI｜上高地で過ごす一日',text:'河童橋と川沿いをゆっくり歩く休日の一案。',url});$('plan-status').textContent='共有画面を閉じました。';return; }
      if (!navigator.clipboard?.writeText) throw Error('no clipboard');
      await navigator.clipboard.writeText(url);$('plan-status').textContent='個人の入力内容を含まない滞在案リンクをコピーしました。';
    } catch(e) {
      if(e.name==='AbortError'){ $('plan-status').textContent='共有をキャンセルしました。';return; }
      $('plan-copy').hidden=false;$('plan-copy-url').value=url;$('plan-copy-url').focus();$('plan-copy-url').select();$('plan-status').textContent='このリンクをコピーして共有できます。';
    }
  });
  $('plan-delete').addEventListener('click', () => {
    if (!confirm('このブラウザに保存した上高地の計画を削除しますか？')) return;
    try { localStorage.removeItem(key);stored=false;lastPlan=null;form.reset();$('plan-result').hidden=true;$('plan-status').textContent='保存した計画を削除しました。'; }
    catch { $('plan-status').textContent='ブラウザ内の保存を削除できませんでした。ブラウザのサイトデータ設定をご確認ください。'; }
  });
  form.hidden = false;
})();
