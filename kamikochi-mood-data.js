/* Shared editorial suggestions: no external API or inferred personal profile. */
window.YamatabiKamikochi = (() => {
  const moods = {
    calm: {label:'ひと息つきたい',title:'梓川の流れに、目を預ける一日。',why:'景色を次々に巡るより、川の色や流れを眺める時間を多めに。',pause:'開放されている川沿いの園路で、通行を妨げずひと休み。飲み物をひとくち、何もせず眺める時間も。',place:'river'},
    talk: {label:'誰かとゆっくり話したい',title:'同じ景色を見ながら、話す一日。',why:'歩く区間と休む時間を分け、お互いのペースで会話を楽しむ案です。',pause:'橋では通行を優先し、ゆっくり話すなら開放された園路や利用できる休憩場所へ。混雑時は無理に静かな場所を探さず、歩く範囲を小さく。',place:'bridge'},
    curious: {label:'自然をじっくり見たい',title:'木々や光の違いを、見つける一日。',why:'遠くの山だけでなく、川岸の木々や光に目を向けてみる案です。',pause:'葉の色、水の色、木陰の光を見比べる。気になる景色では、立ち止まれる場所で少し足を止めて。',place:'konashi'},
    refresh: {label:'軽く気分転換したい',title:'山と川を見上げて、切り替える一日。',why:'橋からの眺めをひとつの目的にして、予定を詰め込まずに楽しむ案です。',pause:'河童橋周辺の景色を眺めて深呼吸。写真を撮っても、撮らなくても。疲れる前に戻る選択を残して。',place:'bridge'}
  };
  const walks = {
    short:{label:'河童橋周辺で折り返す',distance:'往復 約600m',time:'歩行 約12分',route:['上高地バスターミナル','河童橋・川沿いの開放された園路','上高地バスターミナルへ戻る']},
    standard:{label:'小梨平まで歩いて戻る',distance:'往復 約1.6km',time:'歩行 約32分',route:['上高地バスターミナル','河童橋','小梨平方面の園路','同じ道で河童橋・ターミナルへ戻る']}
  };
  function suggest(mood,pace) {
    if(!Object.hasOwn(moods,mood)) return null;
    const walk=pace==='standard'?'standard':'short';
    const details=moods[mood];
    return {...details,mood,walk,...walks[walk],place:details.place==='konashi'&&walk==='short'?'bridge':details.place,reason:(pace==='unknown'?'歩く量が未定なので、まず河童橋周辺の短めの案から。':'')+details.why};
  }
  return {moods,walks,suggest};
})();
