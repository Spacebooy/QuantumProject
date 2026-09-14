import { nextGuidance } from './tutorialGuidance';
import { plainExplanations } from './tutorialPlainLanguage';
import { useEffect, useRef, useState } from 'react';
import QubitBot from './QubitBot';
import TutorialHighlight from './TutorialHighlight';
import TutorialLessonSelector from './TutorialLessonSelector';
import { actionFeedback } from './tutorialUtils';
export default function TutorialOverlay({tutorial:t,snapshot,busy}) {
  const heading=useRef(null);
  const [locate,setLocate]=useState(0);
  const [motion,setMotion]=useState(true);
  const panel=useRef(null);
  useEffect(()=>{
    heading.current?.focus({preventScroll:true});
  },[t.view,t.position.lessonId,t.position.index]);
  useEffect(()=>{
    return ()=>{requestAnimationFrame(()=>document.querySelector('.tutorial-entry button')?.focus({preventScroll:true}));};
  },[]);
  useEffect(()=>{
    const element=panel.current;
    if(!element)return;
    const observer=new ResizeObserver(()=>document.documentElement.style.setProperty('--tutorial-height',`${element.getBoundingClientRect().height+48}px`));
    observer.observe(element);
    return ()=>{observer.disconnect();document.documentElement.style.removeProperty('--tutorial-height');};
  },[]);
  const step=t.step;
  const wrong=t.running && step.type==='interaction' ? actionFeedback(step,snapshot.grid):'';
  const guidance=t.running ? nextGuidance({...step,qubits:t.lesson.qubits},snapshot,{passed:t.passed,ready:t.ready,busy}) : {};
  const plain=t.running && plainExplanations[t.lesson.id]?.[step.id];
  const title=t.view==='welcome'?'Welcome to the Quantum Simulator':t.view==='selector'?'Choose a Lesson':step.title;
  return <>
    {t.running && <TutorialHighlight target={guidance.target} secondaryTarget={guidance.secondaryTarget} label={guidance.label} motion={motion} stepKey={`${t.lesson.id}/${step.id}/${t.passed}/${locate}`} />}
    <aside ref={panel} className={`tutorial-panel tutorial-${t.view}`} aria-label="Guided tutorial" onKeyDown={e=>{if(e.key==='Escape'){e.stopPropagation();t.exit();}}}>
      <div className="tutorial-heading"><QubitBot mood={t.passed?'success':wrong?'hint':step?.botMood || 'neutral'}/><div><small>QUBIT BOT {t.running && `· ${t.lesson.title} · ${t.position.index+1}/${t.lesson.steps.length}`}</small><h2 ref={heading} tabIndex={-1}>{title}</h2></div><button onClick={t.exit} aria-label="Exit Tutorial">Exit</button></div>
      {t.view==='welcome' && <><p>Let’s try one small action at a time. Follow the glowing outline—it shows exactly where to look or click. You can skip anything. Your original circuit comes back when you exit.</p><div className="tutorial-buttons"><button onClick={()=>t.start('qubit')} disabled={busy}>Start Tutorial</button><button onClick={t.choose}>Choose Lesson</button>{t.canResume && <button onClick={t.resume} disabled={busy}>Resume Tutorial</button>}<button onClick={t.exit}>Maybe Later</button></div></>}
      {t.view==='selector' && <TutorialLessonSelector tutorial={t}/>}
      {t.running && <>
        {step.type==='explanation' && <p className="tutorial-plain">{plain || step.message}</p>}
        {step.type==='interaction' && !t.passed && <div className="tutorial-do-next" role="status"><small>DO THIS NOW</small><p>{guidance.instruction}</p><button onClick={()=>setLocate(n=>n+1)}>Show me where</button></div>}
        {step.type==='interaction' && step.setup?.length>0 && !t.passed && <p className="tutorial-prepared">We already placed {step.setup.map(op=>op.gate).join(' → ')} to get you started.</p>}
        <details className="tutorial-details" key={`${t.lesson.id}/${step.id}`}><summary>{step.type==='interaction'?'See the full task':'Why does this work?'}</summary><p>{step.message}</p></details>
        {['bloch','probabilities','amplitudes','measurement'].includes(step.targetElement) && !snapshot.results && <p className="tutorial-hint">No API result is displayed yet. Run the current circuit to inspect it, or continue without the example.</p>}
        <div className="tutorial-feedback" role="status">
          {t.passed ? step.successMessage : wrong || ''}
          {!t.passed && t.verification?.ok===false && !wrong && <span> The result did not meet this step yet. Check the example and run again.</span>}
        </div>
        {t.hintIndex>0 && <p className="tutorial-hint">Hint: {step.hints?.[Math.min(t.hintIndex-1,(step.hints?.length || 1)-1)] || 'Inspect the highlighted control. You can skip this step or choose another lesson at any time.'}</p>}
        <div className="tutorial-buttons"><button onClick={t.back} disabled={busy || t.position.index===0}>Back</button><button onClick={t.skip} disabled={busy}>Skip Step</button><button onClick={t.next} disabled={busy || (step.type==='interaction' && !t.passed)}>Next</button><button onClick={t.hint}>Hint</button>{step.destination && <button onClick={t.destination}>Open {step.destination==='missions'?'Quantum Missions':'Algorithms'}</button>}</div>
        <div className="tutorial-secondary"><button onClick={t.choose}>Choose Lesson</button><button onClick={()=>setMotion(m=>!m)}>{motion ? 'Pause glow' : 'Animate glow'}</button><button onClick={t.restart} disabled={busy}>Restart Lesson</button><button onClick={t.skipLesson} disabled={busy}>Skip Lesson</button><span>{t.completed}/18 completed</span></div>
      </>}
    </aside>
  </>;
}
