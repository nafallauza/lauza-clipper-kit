import {AbsoluteFill,OffthreadVideo,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import {FontStyles} from './FontStyles';
type Word={w:string;s:number;e:number};
export const ReviewClip=({source,words}:{source:string;words:Word[]})=>{
 const frame=useCurrentFrame(),{fps}=useVideoConfig(),t=frame/fps;
 const groups:Word[][]=[];
 for(const word of words){
  const row=groups[groups.length-1];
  const count=row?.reduce((n,w)=>n+w.w.split(/\s+/).length,0)||0;
  if(!row||count>=4||count+word.w.split(/\s+/).length>5)groups.push([word]);else row.push(word);
 }
 if(groups.length>1&&groups.at(-1)!.reduce((n,w)=>n+w.w.split(/\s+/).length,0)<2)groups.at(-1)!.unshift(groups[groups.length-2].pop()!);
 const row=groups.find((g,i)=>t>=g[0].s&&t<Math.min(g[g.length-1].e+.06,groups[i+1]?.[0].s??Infinity));
 return <AbsoluteFill style={{backgroundColor:'#171717'}}><FontStyles/>
  <OffthreadVideo src={staticFile(source)} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
  <AbsoluteFill style={{background:'linear-gradient(to bottom,transparent 40%,rgba(0,0,0,.35) 65%,rgba(0,0,0,.95) 100%)'}}/>
  <div style={{position:'absolute',top:1320,left:90,right:150,textAlign:'center',fontFamily:'Adwaita Sans',fontWeight:700,fontSize:80,lineHeight:1.1,color:'#F7F7F7'}}>
   {row?.map((w,i)=><span key={i} style={{visibility:t>=w.s?'visible':'hidden'}}>{w.w}{' '}</span>)}
  </div>
 </AbsoluteFill>;
};
