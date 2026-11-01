import {FontStyles} from '../../../src/shared/FontStyles';
import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import plan from './plan.json';
import captions from './captions-styled.json';
import motion from './motion.json';
import track from './tracking.json';
import style from '../style.json';

const C=style.colors;
const clamp=(v:number)=>Math.min(1,Math.max(0,v));
const ease=(v:number)=>1-Math.pow(1-clamp(v),3);
const r=(t:number,s:number,d=.35)=>ease((t-s)/d);
const A=plan.anchors;
type Scene=typeof plan.scenes[number];
export const cameraFocusAt=(t:number)=>t<motion.openingPullback.duration?motion.openingPullback.focusY:motion.cameraFocusY;
export const cameraZoomAt=(t:number)=>{
 const u=clamp(t/motion.openingPullback.duration),smooth=u*u*u*(10+u*(-15+6*u));
 return 1+(motion.openingPullback.zoom-1)*(1-smooth)+Math.max(0,...motion.cameraBeats.map(b=>(b.zoom-1)*r(t,b.start,b.attack)*(1-r(t,b.end-b.release,b.release))));
};
const T=({x=540,y,size=64,fill=C.ink,italic=false,anchor='middle',children}:{x?:number;y:number;size?:number;fill?:string;italic?:boolean;anchor?:'middle'|'start'|'end';children:React.ReactNode})=><text x={x} y={y} textAnchor={anchor} fontFamily={italic?'Caladea':'Montserrat'} fontStyle={italic?'italic':'normal'} fontWeight={italic?400:800} fontSize={size} letterSpacing={italic?-1: -1.5} fill={fill}>{children}</text>;
const Box=({x,y,w,h,fill=C.white,shadow=10}:{x:number;y:number;w:number;h:number;fill?:string;shadow?:number})=><><rect x={x+shadow} y={y+shadow} width={w} height={h} fill={C.ink}/><rect x={x} y={y} width={w} height={h} fill={fill} stroke={C.ink} strokeWidth="6"/></>;
const Note=({x=0,y=0,s=1,angle=0,fill=C.yellow}:{x?:number;y?:number;s?:number;angle?:number;fill?:string})=><g transform={`translate(${x} ${y}) rotate(${angle}) scale(${s})`}><rect width="180" height="94" fill={fill} stroke={C.ink} strokeWidth="5"/><rect x="12" y="12" width="156" height="70" fill="none" stroke={C.ink} strokeWidth="2"/><T x={90} y={62} size={36}>Rp</T></g>;
const Wallet=({x,y,s=1,open=0}:{x:number;y:number;s?:number;open?:number})=><g transform={`translate(${x} ${y}) scale(${s})`}><rect x="0" y="0" width="270" height="160" rx="9" fill={C.structure} stroke={C.ink} strokeWidth="6"/><path d="M0 12H270V65H0Z" fill={C.surface} stroke={C.ink} strokeWidth="5" transform={`rotate(${-22*open} 0 12)`}/><rect x="191" y="70" width="93" height="50" rx="5" fill={C.yellow} stroke={C.ink} strokeWidth="5"/><circle cx="211" cy="95" r="6" fill={C.ink}/></g>;
const Page=({x,y,w=470,h=480}:{x:number;y:number;w?:number;h?:number})=><g><Box x={x} y={y} w={w} h={h}/><path d={`M${x+45} ${y+80}H${x+w-45}M${x+45} ${y+h-130}H${x+w-45}M${x+45} ${y+h-85}H${x+w-110}`} stroke={C.gray} strokeWidth="6"/></g>;
const Lock=({x,y,s=1,close=1}:{x:number;y:number;s?:number;close?:number})=><g transform={`translate(${x} ${y}) scale(${s})`}><path d="M-36 10V-28A36 36 0 0136 -28V10" fill="none" stroke={C.ink} strokeWidth="12" transform={`translate(0 ${-32*(1-close)}) rotate(${-22*(1-close)} -36 10)`}/><rect x="-54" y="8" width="108" height="85" fill={C.yellow} stroke={C.ink} strokeWidth="6"/><circle cy="44" r="9" fill={C.ink}/><path d="M0 45V64" stroke={C.ink} strokeWidth="7"/></g>;
const Back=({soft=false,dark=false}:{soft?:boolean;dark?:boolean})=><><rect width="1080" height="1920" fill={dark?C.ink:soft?C.surface:C.paper}/>{Array.from({length:16},(_,i)=><path key={i} d={`M${i*80} 0V1920M0 ${i*120}H1080`} stroke={dark?C.white:C.ink} strokeWidth="1" strokeOpacity=".055"/>)}<path d="M78 260H180M78 260V360M1000 1520H900M1000 1520V1420" fill="none" stroke={dark?C.structure:C.ink} strokeWidth="5"/></>;

const Empty=({t,s}:{t:number;s:Scene})=>{
 const p=r(t,s.start,.4),open=r(t,s.start+1,.4);
 return <><T y={390} size={65}>KERJA BERTAHUN-TAHUN.</T>
  <g transform={`translate(${-420*(1-p)} 0) rotate(-4 370 850)`}><Box x={145} y={640} w={440} h={470} fill={C.white}/><rect x="145" y="640" width="440" height="90" fill={C.structure} stroke={C.ink} strokeWidth="6"/>
   <path d="M230 610V675M495 610V675" stroke={C.ink} strokeWidth="14"/>
   {Array.from({length:9},(_,i)=><rect key={i} x={196+i%3*115} y={780+Math.floor(i/3)*90} width="55" height="44" fill={i<6?C.gray:C.yellow}/>)}
   {[0,1,2].map(i=>{const q=r(t,s.start+.2+i*.18,.5);return q<1&&<g key={i} opacity={1-q} transform={`translate(${-160*q} ${-230*q}) rotate(${-25*q} 370 850)`}><rect x="159" y="744" width="410" height="345" fill={C.white} stroke={C.ink} strokeWidth="4"/><path d="M210 810L510 1020M510 810L210 1020" stroke={C.yellow} strokeWidth="15"/></g>;})}</g>
  <g transform={`translate(${400*(1-p)} 0)`}><Wallet x={640} y={890} s={1.05} open={open}/><T x={780} y={810} size={95} italic>rekening?</T></g>
  <g transform={`translate(0 ${70*(1-open)})`} opacity={open}><T y={1370} size={140} fill={C.structure}>KOSONG.</T></g></>;
};
const Profit=({t,s}:{t:number;s:Scene})=>{
 const enter=r(t,s.start,.35),split=r(t,A.margin,.6),profit=r(t,A.profit,.45);
 return <><T x={925} y={290} size={24} anchor="end">ILUSTRASI PERHITUNGAN</T><T y={400} size={61}>OMZET SETAHUN.</T>
  <g transform={`translate(${-210*profit} 0) translate(540 580) scale(${1-.35*profit}) translate(-540 -580)`}><Box x={205} y={470} w={670} h={220} fill={C.yellow}/><T y={640} size={182}>20 M</T></g>
  <path d="M110 1010H970" stroke={C.ink} strokeWidth="5"/>
  {Array.from({length:20},(_,i)=>{const p=r(t,s.start+.03*i,.3),selected=i<2;return <g key={i} transform={`translate(${140+i%10*80+(selected?0:160*split)} ${800+Math.floor(i/10)*100+80*(1-p)+(selected?120*split:0)})`} opacity={p*(selected?1:1-.88*split)}><rect width="64" height="74" fill={selected&&split>.1?C.yellow:C.structure} stroke={C.ink} strokeWidth="4"/></g>;})}
  <g opacity={split} transform={`translate(${320*(1-split)} 0)`}><Box x={650} y={700} w={270} h={120} fill={C.surface} shadow={7}/><T x={785} y={785} size={76}>10%</T><T x={785} y={870} size={28}>NET PROFIT MARGIN</T></g>
  <g opacity={profit} transform={`translate(${750*(1-profit)} 0)`}><T y={1260} size={184}>2 M</T><path d="M300 1300H780" stroke={C.yellow} strokeWidth="16"/><T y={1400} size={52}>UNTUNG BERSIH.</T></g>
  <path d="M110 1080V1120H250" stroke={C.ink} strokeWidth="6" fill="none" opacity={enter}/></>;
};
const Receivable=({t,s}:{t:number;s:Scene})=>{
 const p=r(t,s.start,.4),stamp=r(t,A.piutang+.22,.2),lock=r(t,A.piutang+1.1,.3);
 return <><T y={370} size={69}>UNTUNG BELUM CAIR.</T>
  <g transform={`translate(${480*(1-p)} 0) rotate(${-6*(1-p)} 540 800)`}><Page x={215} y={520} w={640} h={600}/><T x={270} y={640} size={38} anchor="start">TAGIHAN</T><T y={835} size={155}>Rp2 M</T>
   <g transform={`translate(540 955) rotate(-7) scale(${1.25-.25*stamp})`} opacity={stamp}><Box x={-260} y={-54} w={520} h={105} fill={C.yellow} shadow={6}/><T x={0} y={22} size={53}>BELUM JADI CASH</T></g></g>
  {[0,1].map(i=>{const q=r(t,s.start+.12+i*.12,.65);return <g key={i} opacity={1-q} transform={`translate(${-250*q} ${-160*q})`}><Note x={170+i*240} y={1060} s={.8} angle={-12}/></g>;})}
  <g opacity={lock}><Lock x={540} y={1175} s={1.1} close={lock}/></g><T y={1435} size={112} fill={C.structure}>PIUTANG.</T></>;
};
const Paper=({t,s}:{t:number;s:Scene})=>{
 const p=r(t,s.start,.4),open=r(t,s.start+.6,.35);
 return <><T y={390} size={75}>UNTUNG DI KERTAS.</T><g transform={`translate(${-420*(1-p)} 0) rotate(-3 320 850)`}><Page x={120} y={590} w={390} h={490}/><T x={315} y={840} size={115}>2 M</T></g>
  <g transform={`translate(${440*(1-p)} 0)`}><Wallet x={660} y={810} s={.92} open={open}/><T x={785} y={1110} size={37}>DI REKENING</T></g><T x={570} y={875} size={140} fill={C.ink}>≠</T>
  <path d="M140 1170H940" stroke={C.ink} strokeWidth="5" strokeDasharray="800" strokeDashoffset={800*(1-r(t,s.start+1,.4))}/><T y={1370} size={66}>ANGKA ≠ CASH.</T></>;
};
const Illusion=({t,s}:{t:number;s:Scene})=>{
 const vanish=r(t,A.ilusi,.22),p=r(t,s.start,.4);
 return <><Back dark/><T y={390} size={64} fill={C.white}>BELUM MASUK REKENING.</T><g transform={`translate(0 ${70*(1-p)})`} opacity={p}><path d="M315 830L540 690L765 830Z" fill={C.structure} stroke={C.white} strokeWidth="5"/>{[380,540,700].map(x=><rect key={x} x={x-28} y="855" width="56" height="220" fill={C.white}/>)}<path d="M300 1100H780M280 1135H800" stroke={C.white} strokeWidth="12"/></g>
  {[0,1,2].map(i=>{const q=r(t,s.start+.15+i*.13,.7);return <g key={i} opacity={q*(1-vanish)} transform={`translate(${150*q+250*vanish} ${-50*q-250*vanish}) rotate(${35*vanish} 300 700)`}><Note x={120+i*120} y={630-i*35} s={.85}/></g>;})}
  <path d="M840 750L950 860M950 750L840 860" stroke={C.yellow} strokeWidth="13" opacity={r(t,s.start+.9,.2)}/><g transform={`translate(${800*(1-vanish)} 0)`}><T y={1380} size={150} fill={C.yellow}>ILUSI.</T></g></>;
};
const Foundation=({t,s}:{t:number;s:Scene})=>{
 const base=r(t,A.sehat,.4),grow=r(t,A.scale,.7);
 return <><T y={390} size={t<A.scale?72:91}>{t<A.marginHealth?'EARLY STAGE.':t<A.scale?'MARGIN SEHAT DULU.':'BARU SCALE UP.'}</T>
  <g transform={`rotate(${-5*(1-base)} 540 1130)`}>{[0,1,2,3].map(i=>{const p=i===0?r(t,s.start,.4):r(grow,i*.14,.3);return <g key={i} transform={`translate(0 ${-i*128})`}><clipPath id={`floor-${i}`}><rect x="290" y={1045-120*p} width="510" height={120*p}/></clipPath><g clipPath={`url(#floor-${i})`}><Box x={310} y={925} w={460} h={120} fill={i%2?C.surface:C.structure} shadow={8}/>{[0,1,2,3].map(j=><rect key={j} x={345+j*110} y="955" width="54" height="52" fill={C.white} stroke={C.ink} strokeWidth="3"/>)}</g></g>;})}
   <Box x={250-30*base} y={1075} w={580+60*base} h={120} fill={base>.1?C.yellow:C.gray}/>{t>=A.marginHealth&&<T y={1155} size={49}>{t>=A.sehat?'MARGIN SEHAT':'MARGIN'}</T>}</g>
  <path d="M900 1090V550M870 590L900 550L930 590" stroke={C.ink} strokeWidth="8" fill="none" strokeDasharray="650" strokeDashoffset={650*(1-grow)}/><T y={1410} size={59} italic>{t<A.scale?'kuatkan fondasinya.':'baru tumbuh.'}</T></>;
};

const Icons=({t}:{t:number})=><>{motion.icons.filter(b=>t>=b.start&&t<b.end).map((b,i)=>{
 const p=r(t,b.start,.16),exit=r(t,b.end-.13,.13),dx=(b.x<540?-190:190)*(1-p)+(b.x<540?-160:160)*exit;
 return <g key={i} data-speaker-icon={b.kind} data-transparent-icon="true" transform={`translate(${b.x+dx} ${b.y}) scale(1.05)`}>
  {b.kind==='revenue'&&<>{[0,1,2].map(j=>{const q=r(t,b.start+j*.1,.25);return <g key={j} opacity={q} transform={`translate(0 ${-25*j-100*(1-q)})`}><Note x={-92} y={0} s={1} fill={j===1?C.surface:C.yellow}/></g>;})}</>}
  {b.kind==='work'&&<><path d="M-40 -40V-78H40V-40" stroke={C.ink} strokeWidth="8" fill="none"/><rect x="-98" y="-40" width="196" height="125" rx="5" fill={C.structure} stroke={C.ink} strokeWidth="6"/><path d="M-98 0Q0 40 98 0" stroke={C.ink} strokeWidth="5" fill="none"/><circle cx="65" cy="-56" r="48" fill={C.white} stroke={C.ink} strokeWidth="6"/><g transform={`rotate(${300*r(t,b.start,.9)} 65 -56)`}><path d="M65 -88V-56L89 -42" stroke={C.ink} strokeWidth="5" fill="none"/></g></>}
  {b.kind==='cash'&&<><rect x="-115" y="-10" width="220" height="102" fill={C.surface} stroke={C.ink} strokeWidth="6"/><g transform={`translate(0 ${-100*(1-r(t,b.start+.05,.4))})`}><Note x={-85} y={-64} s={.82}/></g><path d="M-115 8H105V92H-115Z" fill={C.structure} stroke={C.ink} strokeWidth="6"/><rect x="45" y="28" width="72" height="42" fill={C.yellow} stroke={C.ink} strokeWidth="5"/></>}
  {(b.kind==='receivable'||b.kind==='receipt')&&<><path d="M-78 -102H48L80 -70V94H-78Z" fill={C.white} stroke={C.ink} strokeWidth="6"/><path d="M48 -102V-70H80M-50 -50H44M-50 -25H12" fill="none" stroke={C.ink} strokeWidth="5"/>{b.kind==='receivable'?<Lock x={22} y={20} s={.7} close={r(t,b.start+.25,.4)}/>:<g transform={`rotate(${-8*r(t,b.start,.25)}) translate(0 ${40*(1-r(t,b.start,.25))})`}><rect x="-96" y="10" width="190" height="66" fill={C.yellow} stroke={C.ink} strokeWidth="5"/><T x={0} y={57} size={50}>BON</T></g>}</>}
  {b.kind==='bank'&&<><path d="M-98 -34L0 -97L98 -34Z" fill={C.structure} stroke={C.ink} strokeWidth="6"/>{[-65,0,65].map(x=><rect key={x} x={x-15} y="-18" width="30" height="93" fill={C.white} stroke={C.ink} strokeWidth="4"/>)}<path d="M-104 90H104" stroke={C.ink} strokeWidth="9"/><circle cx={-120+85*r(t,b.start,.55)} cy={-95+50*r(t,b.start,.55)} r="24" fill={C.yellow} stroke={C.ink} strokeWidth="4"/></>}
  {b.kind==='alert'&&<><path d="M0 -100L98 80H-98Z" fill={C.yellow} stroke={C.ink} strokeWidth="6"/><path d="M0 -40V17" stroke={C.ink} strokeWidth="15"/><circle cy="47" r="8" fill={C.ink}/></>}
 </g>;
})}</>;

const Captions=({t}:{t:number})=>{
 const clock=t+1/30,g=captions.find(c=>clock>=c.start&&clock<c.end);if(!g)return null;
 return <g data-subtitle-layer="speaker-only">{g.words.map((w,i)=>{
  if(clock<w.start)return null;const p=r(clock,w.start,w.entranceSeconds),marker=w.emphasis==='yellow-marker';
  const distance=w.entranceSeconds<.05?24:w.size>=88?92:56;
  const dx=w.direction==='left'?-distance*(1-p):w.direction==='right'?distance*(1-p):0,dy=w.direction==='down'?-48*(1-p):w.direction==='up'?48*(1-p):0;
  const color=marker?C.ink:w.emphasis==='yellow-text'?C.yellow:C.white;
  return <g key={i} opacity={Math.min(1,p*3)} transform={`translate(${dx} ${dy})`}>
   {marker&&<path d={`M${w.x-12} ${w.y-w.size*.83}H${w.x+w.width+12}V${w.y+12}H${w.x-12}Z`} fill={C.yellow}/>}
   {w.emphasis==='yellow-underline'&&<path d={`M${w.x-2} ${w.y+12}H${w.x+w.width+3}`} stroke={C.yellow} strokeWidth="9" strokeDasharray={w.width+5} strokeDashoffset={(w.width+5)*(1-p)}/>}
   <text x={w.x} y={w.y} fontFamily={w.family} fontSize={w.size} fontWeight={w.weight} fontStyle={w.fontStyle} fill={color}>{w.text}</text>
  </g>;
 })}</g>;
};
export const NeoArtwork=({frame}:{frame:number})=>{
 const t=frame/30,full=plan.scenes.find(s=>s.mode==='full'&&t>=s.start&&t<s.end),quote=t>=A.hiroshima-.15&&t<A.bon+.6,q=r(t,A.bon-.025,.12);
 const entry=full?r(t,full.start,.18):1,exit=full?r(t,full.end-.12,.12):0;
 return <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
  <defs><linearGradient id="bottom-fade" x1="0" y1={motion.bottomGradient.topY} x2="0" y2={motion.bottomGradient.bottomY} gradientUnits="userSpaceOnUse">{motion.bottomGradient.stops.map(([offset,opacity])=><stop key={offset} offset={offset} stopColor="#000" stopOpacity={opacity}/>)}</linearGradient></defs>
  {!full&&<rect y={motion.bottomGradient.topY} width="1080" height={1920-motion.bottomGradient.topY} fill="url(#bottom-fade)"/>}
  {full&&<g data-full-motion={full.id} transform={`translate(${1080*(1-entry)-1080*exit} 0)`}><Back soft={full.id==='paper'}/>{full.id==='empty-wallet'&&<Empty t={t} s={full}/>} {full.id==='profit'&&<Profit t={t} s={full}/>} {full.id==='piutang'&&<Receivable t={t} s={full}/>} {full.id==='paper'&&<Paper t={t} s={full}/>} {full.id==='illusion'&&<Illusion t={t} s={full}/>} {full.id==='foundation'&&<Foundation t={t} s={full}/>}</g>}
  {!full&&<Icons t={t}/>}
  {quote&&<g data-speaker-quote="true"><T x={150} y={1250} size={40} fill={C.white} anchor="start">{t>=A.business-1/30?'BISNIS':'HIROSHIMA'}</T><T x={920} y={1250} size={45} fill={C.white} italic anchor="end">hancur karena</T><g opacity={t>=A.bom-1/30?1-q:0}><T y={1450} size={222} fill={C.white}>BOM</T></g><g transform={`translate(${320*(1-q)} 0)`} opacity={q}><T y={1450} size={222} fill={C.yellow}>BON</T><path d="M300 1490H780" stroke={C.structure} strokeWidth="13"/></g></g>}
  {!full&&!quote&&<Captions t={t}/>}
 </svg>;
};
export const TimothyNeoClip=()=>{
 const frame=useCurrentFrame(),t=frame/30,scale=1920/1080,crop=track.cropXByFrame[Math.min(frame,1559)];
 const mono=clamp((t-(A.hiroshima-.15))/.2)*(1-clamp((t-(A.bon+.4))/.2));
 return <AbsoluteFill style={{backgroundColor:C.ink,overflow:'hidden'}}><FontStyles/>
  <AbsoluteFill style={{transform:`scale(${cameraZoomAt(t)})`,transformOrigin:`50% ${cameraFocusAt(t)*100}%`}}><OffthreadVideo muted src={staticFile(plan.source)} style={{position:'absolute',width:1920*scale,height:1920,left:-crop*scale,top:0,maxWidth:'none',filter:`grayscale(${mono})`}}/></AbsoluteFill><AbsoluteFill><NeoArtwork frame={frame}/></AbsoluteFill><Audio src={staticFile('brands/lauza/timothy-reference/master.wav')}/>
 </AbsoluteFill>;
};
