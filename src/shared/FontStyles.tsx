import {useEffect,useState} from 'react';
import {cancelRender,continueRender,delayRender,staticFile} from 'remotion';
const fonts=[['Adwaita Sans','AdwaitaSans-Regular.ttf','100 900','normal'],['Montserrat','Montserrat-ExtraBold.otf','800','normal'],['Caladea','Caladea-Italic.ttf','400','italic']];
export const FontStyles=()=>{
 const [handle]=useState(()=>delayRender('Load local Lauza fonts'));
 useEffect(()=>{
  Promise.all(fonts.map(async([family,,weight,style])=>{
   const loaded=await document.fonts.load(`${style} ${weight.includes(' ')?'700':weight} 80px "${family}"`);
   if(!loaded.length)throw new Error(`Local font unavailable: ${family}`);
  })).then(()=>continueRender(handle)).catch(cancelRender);
 },[handle]);
 return <style>{fonts.map(([family,file,weight,style])=>`@font-face{font-family:'${family}';src:url('${staticFile('shared/fonts/'+file)}');font-weight:${weight};font-style:${style};}`).join('')}</style>;
};
