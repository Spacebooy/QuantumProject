import { jsxDEV as base, Fragment } from 'react/jsx-dev-runtime';
import { LocalizedElement, LocalizedFragment } from './language.js';
export { Fragment };
export function jsxDEV(type,props,key,isStatic,source,self){return typeof type==='string'?base(LocalizedElement,{tag:type,sourceProps:props,staticChildren:isStatic},key,false,source,self):base(type===Fragment?LocalizedFragment:type,type===Fragment?{...props,staticChildren:isStatic}:props,key,isStatic,source,self);}
