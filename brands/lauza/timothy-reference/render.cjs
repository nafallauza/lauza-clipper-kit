// Remotion composition and offline exporter share the same frame-pure artwork.
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const ts=require('typescript');
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const root=path.resolve(__dirname,'../../..'), out=path.join(root,'out/timothy-reference');
const media=path.join(root,'public/brands/lauza/timothy-reference');
const plan=require('./plan.json'), track=require('./tracking.json');
const outputName='timothy-reference.mp4';
const quoteStart=plan.anchors.hiroshima-.15, quoteEnd=plan.anchors.bon+.6;
const clamp=v=>Math.max(0,Math.min(1,v));
const grayAt=t=>clamp((t-quoteStart)/.2)*(1-clamp((t-(quoteEnd-.2))/.2));
const run=args=>execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y',...args],{stdio:'inherit',env:{...process.env,FONTCONFIG_FILE:path.join(out,'fonts.conf')}});
fs.mkdirSync(out,{recursive:true});
const xml=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
fs.writeFileSync(path.join(out,'fonts.conf'),`<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd"><fontconfig><include ignore_missing="yes">/etc/fonts/fonts.conf</include><dir>${xml(path.join(root,'public/shared/fonts'))}</dir><cachedir>${xml(path.join(out,'font-cache'))}</cachedir></fontconfig>`);

require.extensions['.tsx']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
const {NeoArtwork,cameraZoomAt,cameraFocusAt}=require('./NeoClip.tsx');
const motion=require('./motion.json');
const ease=(s,d)=>`(1-pow(1-clip((on/30-${s})/${d},0,1),3))`;
const zoomTerms=motion.cameraBeats.map(b=>`(${b.zoom-1}*${ease(b.start,b.attack)}*(1-${ease(b.end-b.release,b.release)}))`);
const u=`clip(on/30/${motion.openingPullback.duration},0,1)`;
const smooth=`(pow(${u},3)*(10-15*${u}+6*pow(${u},2)))`;
const zoomExpression=`1+${motion.openingPullback.zoom-1}*(1-${smooth})+`+zoomTerms.reduce((a,b)=>`max(${a},${b})`,'0');
const focusExpression=`if(lt(on/30,${motion.openingPullback.duration}),${motion.openingPullback.focusY},${motion.cameraFocusY})`;
// A large working raster prevents integer zoompan crop steps becoming visible.
const zoomFilter=(z,focus=focusExpression)=>`scale=2160:3840:flags=lanczos,zoompan=z='${z}':x='iw/2-iw/zoom/2':y='(ih-ih/zoom)*(${focus})':d=1:s=1080x1920:fps=30`;
const svg=frame=>renderToStaticMarkup(React.createElement(NeoArtwork,{frame}));
const samples=[0,.1,.3,.6,.9,1.2,1.95,4.15,5.9,7.2,13.7,15.2,16.5,20.95,22.9,24.0,27.8,31.6,34.1,37.8,38.9,40.7,42.2,43.2,44.7,47.6,49.1,51.2];
if(process.argv.includes('--check')){
 for(const time of samples){
  const frame=Math.round(time*30), artwork=path.join(out,`check-${time}.svg`);
  fs.writeFileSync(artwork,svg(frame));
  run(['-ss',String(time),'-i',path.join(root,'public',plan.source),'-i',artwork,
   '-filter_complex',`[0:v]crop=608:1080:${track.cropXByFrame[frame]}:0,${zoomFilter(cameraZoomAt(time),cameraFocusAt(time))},setsar=1,hue=s=${1-grayAt(time)}[v];[v][1:v]overlay=format=auto,format=yuv420p[out]`,
   '-map','[out]','-frames:v','1',path.join(out,`check-${time}.jpg`)]);
 }
 console.log(`${samples.length} check frames ready.`);
}
if(process.argv.includes('--render')){
 const frames=path.join(out,'frames'); fs.mkdirSync(frames,{recursive:true});
 let fullMotionFrames=0, speakerCaptionFrames=0, quoteFrames=0;
 const captionFamilies=new Set();
 for(let frame=0;frame<plan.frames;frame++){
  const markup=svg(frame), time=frame/30;
  const full=plan.scenes.some(s=>s.mode==='full'&&time>=s.start&&time<s.end);
  const caption=markup.includes('data-subtitle-layer');
  if(full){fullMotionFrames++;if(caption)throw new Error(`Subtitle present on full-motion frame ${frame}`);}
  if(caption){speakerCaptionFrames++;for(const m of markup.slice(markup.indexOf('data-subtitle-layer')).matchAll(/font-family="([^"]+)"/g))captionFamilies.add(m[1]);}
  if(markup.includes('data-speaker-quote')){quoteFrames++;if(caption)throw new Error(`Duplicate quote subtitle on frame ${frame}`);}
  fs.writeFileSync(path.join(frames,`f${String(frame).padStart(4,'0')}.svg`),markup);
 }
 fs.writeFileSync(path.join(out,'caption-visibility-audit.json'),JSON.stringify({frames:plan.frames,fullMotionFrames,fullMotionFramesWithSubtitles:0,speakerCaptionFrames,quoteFrames,captionFamilies:[...captionFamilies]},null,2)+'\n');
 const commands=path.join(out,'crop.txt');
 fs.writeFileSync(commands,track.cropXByFrame.map((x,i)=>`${(i/30).toFixed(6)} crop x ${x};`).join('\n')+'\n');
 console.log('1560 editorial frames prepared; encoding original source timeline.');
 run(['-i',path.join(root,'public',plan.source),'-framerate','30','-i',path.join(frames,'f%04d.svg'),'-i',path.join(media,'master.wav'),
  '-filter_complex',`[0:v]fps=fps=30:start_time=0,sendcmd=f='${commands}',crop=608:1080:${track.cropXByFrame[0]}:0,${zoomFilter(zoomExpression)},setsar=1,hue=s='1-clip((t-${quoteStart})/0.2,0,1)*(1-clip((t-${quoteEnd-.2})/0.2,0,1))'[v];[1:v]format=rgba[art];[v][art]overlay=eof_action=pass:repeatlast=0:format=auto,format=yuv420p[out]`,
  '-map','[out]','-map','2:a','-t','52','-r','30','-c:v','libopenh264','-b:v','8M','-g','60','-threads','4',
  '-c:a','aac','-b:a','192k','-ar','48000','-movflags','+faststart',path.join(out,outputName)]);
 console.log('New editorial edit encoded.');
}
