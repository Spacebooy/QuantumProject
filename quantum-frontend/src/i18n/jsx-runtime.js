import { jsx as baseJSX, jsxs as baseJSXs, Fragment } from 'react/jsx-runtime';
import { LocalizedElement, LocalizedFragment } from './language.js';
export { Fragment };
export function jsx(type,props,key){return typeof type==='string'?baseJSX(LocalizedElement,{tag:type,sourceProps:props},key):baseJSX(type===Fragment?LocalizedFragment:type,props,key);}
export function jsxs(type,props,key){return typeof type==='string'?baseJSXs(LocalizedElement,{tag:type,sourceProps:props,staticChildren:true},key):baseJSXs(type===Fragment?LocalizedFragment:type,type===Fragment?{...props,staticChildren:true}:props,key);}
