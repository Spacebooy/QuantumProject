import { Fragment, createContext, createElement, useContext, useEffect, useState } from 'react';
import { translate } from './translate.js';
export const LanguageContext=createContext({language:'en',setLanguage:()=>{}});
export const RawTextContext=createContext(false);
export function LanguageProvider({children}) {
  const [language,setLanguage]=useState(()=>{try{return localStorage.getItem('quantum-language')==='vi'?'vi':'en';}catch{return 'en';}});
  useEffect(()=>{
    document.documentElement.lang=language;
    document.title=language==='vi'?'Mô phỏng lượng tử':'Quantum Simulator';
    try{localStorage.setItem('quantum-language',language);}catch{/* Language switching still works without storage. */}
  },[language]);
  return createElement(LanguageContext.Provider,{value:{language,setLanguage}},children);
}
export function useLanguage(){return useContext(LanguageContext);}

// Shared presentation boundary: translates visible text, never API payloads,
// gate identifiers, input values, event handlers, or simulation state.
export function LocalizedElement({tag,sourceProps,staticChildren}) {
  const {language}=useLanguage();
  const inheritedRaw=useContext(RawTextContext);
  const raw=inheritedRaw || sourceProps.translate==='no';
  const props={...sourceProps};
  if(!raw) {
    for(const key of ['title','placeholder','aria-label','alt']) if(typeof props[key]==='string')props[key]=translate(props[key],language);
    if(tag!=='textarea')props.children=localizeChildren(props.children,language);
  }
  const node=staticChildren && Array.isArray(props.children)
  ? createElement(tag,props,...props.children) : createElement(tag,props);
  return sourceProps.translate==='no'?createElement(RawTextContext.Provider,{value:true},node):node;
}
function localizeChildren(value,language) {
  if(typeof value==='string')return translate(value,language);
  if(Array.isArray(value))return value.map(child=>localizeChildren(child,language));
  return value;
}

export function LocalizedFragment({ children, staticChildren }) {
 const { language } = useLanguage();
 const raw = useContext(RawTextContext);
 const content = raw ? children : localizeChildren(children, language);
 return staticChildren && Array.isArray(content) ? createElement(Fragment, null, ...content) : createElement(Fragment, null, content);
}
