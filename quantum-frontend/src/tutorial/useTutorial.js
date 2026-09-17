import { useRef, useState } from 'react';
import { lessons } from './tutorialLessons';
import { circuitKey, readyForRun, matchesOutcome } from './tutorialUtils';

// Owns only guide progress. Simulator state stays in App; the backup is restored on exit.
export function useTutorial(snapshot, restore, navigate) {
  const [view,setView]=useState('off');
  const [position,setPosition]=useState({lessonId:null,index:0});
  const [progress,setProgress]=useState({});
  const [hintIndex,setHintIndex]=useState(0);
  const [verification,setVerification]=useState(null);
  const backup=useRef(null);
  const paused=useRef(null);
  const lesson=lessons.find(l=>l.id===position.lessonId);
  const step=lesson?.steps[position.index];
  const active=view!=='off';
  const running=view==='lesson';
  const ready=running && step?.type==='interaction' && readyForRun(step,snapshot,lesson.qubits);
  const passed=verification?.id===`${lesson?.id}/${step?.id}` && verification?.key===circuitKey(snapshot) && verification.ok;
  const completed=lessons.filter(l=>l.category!=='Advanced' && l.steps.every(s=>progress[`${l.id}/${s.id}`]==='done')).length;
  const saveOriginal=()=>{ if(!backup.current) backup.current={...snapshot}; };
  function go(lessonId,index=0) {
    saveOriginal();
    const next=lessons.find(l=>l.id===lessonId), nextStep=next.steps[index];
    navigate('simulator');
    if(nextStep.type==='interaction' || lessonId!==position.lessonId || index===0) {
      restore({...snapshot,numQubits:next.qubits,mode:nextStep.mode || 'ideal',grid:(nextStep.setup || []).map((op,i)=>({...op,id:`tutorial-${i}`,step:i})),results:null,error:null,selectedGate:'H',cnotTarget:1,thetaValue:nextStep.theta ?? Math.PI/2,activeTab:'settings'});
    }
    setPosition({lessonId,index});setHintIndex(0);setVerification(null);setView('lesson');
  }
  function advance(skip=false) {
    if(!skip && step.type==='interaction' && !passed) return;
    setProgress(p=>({...p,[`${lesson.id}/${step.id}`]:skip?'skipped':'done'}));
    if(position.index+1<lesson.steps.length) go(lesson.id,position.index+1);
    else setView('selector');
  }
  function exit() {
    if(backup.current) paused.current={snapshot:{...snapshot},verification};
    if(backup.current) restore(backup.current);
    backup.current=null;setView('off');setVerification(null);
  }
  function recordResult(result, submitted) {
    if(!running || step?.type!=='interaction') return;
    const ok=readyForRun(step,submitted,lesson.qubits) && matchesOutcome(result,step.outcome);
    setVerification({id:`${lesson.id}/${step.id}`,key:circuitKey(submitted),ok});
  }
  return {active,running,view,lesson,step,position,progress,hintIndex,passed,ready,completed,verification,
    open:()=>setView('welcome'),choose:()=>setView('selector'),start:go,exit,
    resume:()=>{
      if(!paused.current) {go(position.lessonId,position.index);return;}
      saveOriginal();restore(paused.current.snapshot);setVerification(paused.current.verification);navigate('simulator');setView('lesson');
    },canResume:!!lesson,
    next:()=>advance(false),skip:()=>advance(true),back:()=>go(lesson.id,Math.max(0,position.index-1)),
    restart:()=>{setProgress(p=>Object.fromEntries(Object.entries(p).filter(([key])=>!key.startsWith(lesson.id+'/'))));go(lesson.id);},skipLesson:()=>{setProgress(p=>({...p,...Object.fromEntries(lesson.steps.filter(s=>!p[`${lesson.id}/${s.id}`]).map(s=>[`${lesson.id}/${s.id}`,'skipped']))}));setView('selector');},
    hint:()=>setHintIndex(i=>i+1),recordResult,
    destination:()=>{const page=step.destination;exit();navigate(page);},
  };
}
