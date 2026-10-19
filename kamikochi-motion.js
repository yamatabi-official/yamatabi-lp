/* Small responses to intentional actions. Content remains readable without JS. */
(() => {
  const root=document.querySelector('.kamikochi-page');
  if(!root||!Element.prototype.animate)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const running=new Set();
  function move(node,frames,options){
    if(reduced.matches||document.hidden)return;
    const animation=node.animate(frames,options);running.add(animation);
    animation.finished.catch(()=>{}).finally(()=>running.delete(animation));
    return animation;
  }
  function textResponse(control){
    if(reduced.matches)return;
    // Wrap the existing text nodes, preserving accessible names and live label updates.
    const walker=document.createTreeWalker(control,NodeFilter.SHOW_TEXT);
    const nodes=[];while(walker.nextNode())if(walker.currentNode.textContent.trim()&&!walker.currentNode.parentElement.closest('.k-kinetic-text'))nodes.push(walker.currentNode);
    nodes.forEach((text,index)=>{
      const span=document.createElement('span');span.className='k-kinetic-text';text.replaceWith(span);span.append(text);
      const animation=move(span,[{transform:'translateY(0) skewX(0deg)'},{transform:'translateY(-3px) skewX(-3deg)',offset:.4},{transform:'translateY(0) skewX(0deg)'}],{duration:360,delay:Math.min(index*24,72),easing:'cubic-bezier(.2,.7,.2,1)'});
      function unwrap(){if(span.isConnected)span.replaceWith(...span.childNodes);}
      if(animation)animation.finished.then(unwrap,unwrap);else unwrap();
    });
  }
  const controls='button, a, summary';
  document.addEventListener('click',event=>{
    const control=event.target.closest(controls);if(!control||!root.contains(control))return;
    textResponse(control);
  });
  document.addEventListener('change',event=>{
    if(event.target.matches('.mood-options input')){
      const label=event.target.closest('label')?.querySelector('span');
      if(label){textResponse(label);move(label,[{boxShadow:'0 0 0 0 #518d8738'},{boxShadow:'0 0 0 7px #518d8700'}],{duration:440,easing:'ease-out'});}
    }
  });
  document.querySelectorAll('details').forEach(detail=>detail.addEventListener('toggle',()=>{
    if(detail.open)Array.from(detail.children).filter(n=>n.tagName!=='SUMMARY').forEach((node,index)=>move(node,[{opacity:.45,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{duration:320,delay:Math.min(index*28,84),easing:'ease-out'}));
  }));
  const result=document.querySelector('#mood-result');
  if(result)new MutationObserver(()=>{if(!result.hidden)move(result,[{opacity:.4,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:420,easing:'cubic-bezier(.2,.7,.2,1)'});}).observe(result,{childList:true});
  let observer;
  function headings(){
    if(reduced.matches||observer||!('IntersectionObserver'in window))return;
    observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      const heading=entry.target;observer.unobserve(heading);
      const lines=heading.children.length?Array.from(heading.children):[heading];
      lines.forEach((line,index)=>move(line,[{opacity:.45,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:620,delay:index*70,easing:'cubic-bezier(.2,.7,.2,1)'}));
    }),{threshold:.35});
    document.querySelectorAll('.trip-section h2,.detail-copy h1').forEach(h=>observer.observe(h));
  }
  if(document.querySelector('.k-river-arrival:not(.is-leaving)'))document.addEventListener('kamikochi:arrivalend',headings,{once:true});else headings();
  function stop(){running.forEach(animation=>animation.cancel());running.clear();}
  reduced.addEventListener('change',()=>{if(reduced.matches){stop();observer?.disconnect();}else{observer=null;headings();}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  window.addEventListener('pagehide',stop);
})();
