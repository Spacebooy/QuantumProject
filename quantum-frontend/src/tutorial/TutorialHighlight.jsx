import { useEffect, useState } from 'react';
export default function TutorialHighlight({target,secondaryTarget,stepKey,label='Look here',motion=true}) {
  const [rect,setRect]=useState(null);
  const [secondary,setSecondary]=useState(null);
  useEffect(()=>{
    let element, observer;
    const update=()=>{
      element=document.querySelector(`[data-tutorial-id="${target}"]`) || document.querySelector('[data-tutorial-id="results"]');
      if(!element) {setRect(null);return;}
      const other=secondaryTarget && document.querySelector(`[data-tutorial-id="${secondaryTarget}"]`);
      const r2=other?.getBoundingClientRect();
      setSecondary(r2 ? {left:r2.left-4,top:r2.top-4,width:r2.width+8,height:r2.height+8} : null);
      const r=element.getBoundingClientRect();
      setRect({left:Math.max(3,r.left-4),top:r.top-4,width:Math.min(r.width+8,window.innerWidth-6),height:r.height+8});
    };
    const frame=requestAnimationFrame(()=>{
      update();
      if(element) {
        element.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'});
        const panel=document.querySelector('.tutorial-panel');
        const bottom=panel?.getBoundingClientRect().top ?? window.innerHeight;
        const r=element.getBoundingClientRect();
        if(r.bottom>bottom-18) window.scrollBy(0,r.bottom-bottom+32);
        update();
        observer=new ResizeObserver(update);observer.observe(element);
      }
    });
    window.addEventListener('scroll',update,true);window.addEventListener('resize',update);
    return ()=>{cancelAnimationFrame(frame);observer?.disconnect();window.removeEventListener('scroll',update,true);window.removeEventListener('resize',update);};
  },[target,secondaryTarget,stepKey]);
  return rect && <><div className={`tutorial-highlight ${motion ? 'tutorial-pulsing' : ''}`} aria-hidden="true" style={{...rect,'--target-left':`${rect.left}px`}}><span className={`tutorial-target-label ${rect.top<36 ? 'label-below' : ''}`}>{label}</span></div>{secondary && <div className="tutorial-highlight tutorial-secondary-highlight" aria-hidden="true" style={secondary} />}</>;
}
