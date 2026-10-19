(() => {
  const hero=document.querySelector('.detail-hero'),preview=document.querySelector('#hero-preview'),toggle=document.querySelector('[data-preview-toggle]');
  if(!hero||!preview||!toggle)return;
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let anchorPending=!!location.hash&&!['#scene'].includes(location.hash),userPaused=false,inView=false,arrivalDone=!document.querySelector('.k-river-arrival:not(.is-leaving)');
  preview.muted=true;preview.defaultMuted=true;preview.setAttribute('muted','');preview.setAttribute('playsinline','');preview.setAttribute('webkit-playsinline','');
  function sync(){toggle.textContent=preview.paused?'プレビューを再生':'プレビューを停止';}
  function play(manual=false){
    if(anchorPending||!arrivalDone||!inView||document.hidden||hero.classList.contains('hero-has-video'))return;
    if(!manual&&(userPaused||motion.matches||navigator.connection?.saveData))return;
    if(!preview.hasAttribute('src'))preview.src='assets/kamikochi-preview.mp4';
    preview.hidden=false;preview.muted=true;
    preview.play()?.catch(()=>{preview.hidden=true;sync();});
  }
  toggle.hidden=false;
  toggle.addEventListener('click',()=>{if(!preview.paused){userPaused=true;preview.pause();}else{userPaused=false;play(true);}sync();});
  preview.addEventListener('play',()=>{if(hero.classList.contains('hero-has-video')||!inView||!arrivalDone||document.hidden||userPaused){preview.pause();return;}document.querySelectorAll('video,audio').forEach(media=>{if(media!==preview)media.pause();});sync();});
  preview.addEventListener('pause',sync);
  preview.addEventListener('error',()=>{preview.hidden=true;sync();});
  document.querySelector('[data-hero-play]').addEventListener('click',()=>preview.pause());
  document.querySelector('[data-hero-close]').addEventListener('click',()=>play());
  document.addEventListener('kamikochi:arrivalend',()=>{arrivalDone=true;play();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)preview.pause();else play();});
  window.addEventListener('pagehide',()=>preview.pause());
  window.addEventListener('pageshow',event=>{if(event.persisted){arrivalDone=!document.querySelector('.k-river-arrival:not(.is-leaving)');play();}});
  motion.addEventListener('change',()=>{if(motion.matches)preview.pause();});
  function observeHero(){if('IntersectionObserver'in window)new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;if(!inView)anchorPending=false;if(inView)play();else preview.pause();}).observe(hero);
  else requestAnimationFrame(()=>{const rect=hero.getBoundingClientRect();inView=rect.bottom>0&&rect.top<innerHeight;play();});
  }
  if(location.hash&&document.readyState!=='complete')window.addEventListener('load',()=>requestAnimationFrame(observeHero),{once:true});
  else requestAnimationFrame(observeHero);
})();
