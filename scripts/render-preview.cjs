// Five-second visual style preview. Does not require podcast footage or SFX.
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const root=path.resolve(__dirname,'..'),out=path.join(root,'out'),frames=path.join(out,'style-frames');
fs.mkdirSync(frames,{recursive:true});
for(const ext of ['.tsx','.ts'])require.extensions[ext]=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
const {NeoArtwork}=require('../brands/lauza/timothy-reference/NeoClip.tsx');
for(let i=0;i<150;i++)fs.writeFileSync(path.join(frames,`f${String(i).padStart(3,'0')}.svg`),renderToStaticMarkup(React.createElement(NeoArtwork,{frame:405+i})));
const xml=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const config=path.join(out,'fonts.conf');
fs.writeFileSync(config,`<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd"><fontconfig><include ignore_missing="yes">/etc/fonts/fonts.conf</include><dir>${xml(path.join(root,'public/shared/fonts'))}</dir><cachedir>${xml(path.join(out,'font-cache'))}</cachedir></fontconfig>`);
const env={...process.env,FONTCONFIG_FILE:config};
const encoders=execFileSync('ffmpeg',['-hide_banner','-encoders'],{encoding:'utf8',stdio:['ignore','pipe','pipe']});
const codec=encoders.includes('libx264')?'libx264':encoders.includes('libopenh264')?'libopenh264':null;
if(!codec)throw new Error('No supported H.264 encoder. Use the Remotion browser renderer instead.');
execFileSync('ffmpeg',['-v','error','-y','-framerate','30','-i',path.join(frames,'f%03d.svg'),'-c:v',codec,'-b:v','8M','-pix_fmt','yuv420p','-movflags','+faststart',path.join(out,'style-preview-offline.mp4')],{env,stdio:'inherit'});
execFileSync('ffmpeg',['-v','error','-y','-i',path.join(frames,'f105.svg'),'-frames:v','1',path.join(out,'style-preview.jpg')],{env,stdio:'inherit'});
console.log('out/style-preview-offline.mp4 and out/style-preview.jpg ready.');
