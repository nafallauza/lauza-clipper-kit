"""Mix original dialogue and selected ZIP SFX on the edit's shared frame clock."""
import json
import sys
import sqlite3
import subprocess
from pathlib import Path
import numpy as np
from scipy.io import wavfile

HERE=Path(__file__).resolve().parent; ROOT=HERE.parents[2]
MEDIA=ROOT/'public/brands/lauza/timothy-reference'; OUT=ROOT/'out/timothy-reference'
plan=json.loads((HERE/'plan.json').read_text()); A=plan['anchors']; rate=48000; n=52*rate

def run(args):
 return subprocess.run(['ffmpeg','-hide_banner','-nostats','-y',*args],capture_output=True,text=True,check=True)

def norm(source,target,lufs,peak=-3,pre='anull'):
 base=f'{pre},loudnorm=I={lufs}:TP={peak}:LRA=9'
 r=run(['-i',str(source),'-vn','-af',base+':print_format=json','-f','null','-'])
 m=json.loads(r.stderr[r.stderr.rfind('{'):r.stderr.rfind('}')+1]); options=':'.join(f'{k}={m[v]}' for k,v in [('measured_I','input_i'),('measured_TP','input_tp'),('measured_LRA','input_lra'),('measured_thresh','input_thresh'),('offset','target_offset')])
 run(['-i',str(source),'-vn','-af',base+':'+options+':linear=true','-ar',str(rate),'-ac','2','-c:a','pcm_s24le',str(target)])
 return m

def samples(path):
 return np.frombuffer(subprocess.check_output(['ffmpeg','-hide_banner','-loglevel','error','-i',str(path),'-vn','-ac','1','-ar',str(rate),'-f','f32le','-']),np.float32).copy()

library=sqlite3.connect(ROOT/'asset-library/catalog.sqlite3'); library.row_factory=sqlite3.Row
members={'swish':'%/whoosh-blow-flutter-shortwav-14678.mp3','paper':'%/page-flip-47177.mp3','slide':'%/Paper Slide 03.wav','pop':'%/pop.mp3','cash':'%/cash-register-purchase-87313.mp3'}
members.update(click='%/clop.wav',hit='%/MEME SFX/punch.mp3')
sounds={}; sources={}
for key,pattern in members.items():
 row=library.execute('SELECT id,member,archive FROM assets WHERE ready=1 AND member LIKE ? ORDER BY length(member) LIMIT 1',(pattern,)).fetchone()
 if row is None: raise RuntimeError('Missing library sound: '+key)
 r=json.loads(subprocess.check_output([sys.executable,str(ROOT/'scripts/media-library.py'),'extract',str(row['id'])],cwd=ROOT))
 x=samples(r['path']); peak=int(np.argmax(np.abs(x))); start=max(0,peak-int(.08*rate)); stop=min(len(x),peak+int(.55*rate)); x=x[start:stop]; local_peak=peak-start
 fade=min(240,len(x)//3); x[:fade]*=np.linspace(0,1,fade); tail=min(2400,len(x)//3); x[-tail:]*=np.linspace(1,0,tail)
 x/=max(float(np.max(np.abs(x))),1e-8)
 local_peak=int(np.argmax(np.abs(x)))
 sounds[key]=(x,local_peak); sources[key]={'catalogId':row['id'],'archiveMember':row['member'],'peakAfterTrimSeconds':local_peak/rate,'trimStartSeconds':start/rate}

scene={x['id']:x for x in plan['scenes']}
cues=[(.3,'swish',-29),(A['omzet'],'pop',-28),
 (scene['empty-wallet']['start']+.4,'paper',-27),(scene['empty-wallet']['start']+1.25,'pop',-28),
 (A['twenty'],'slide',-27),(A['margin'],'pop',-28),(A['profit'],'cash',-29),
 (A['cash'],'cash',-30),(scene['piutang']['start']+.45,'slide',-27),(A['piutang']+.47,'paper',-26),(A['piutang']+1.45,'pop',-28),
 (A['piutangAgain']+.05,'pop',-29),(scene['paper']['start']+.4,'paper',-27),(scene['paper']['start']+1,'pop',-29),
 (scene['illusion']['start']+.35,'swish',-28),(A['ilusi']+.1,'swish',-29),
 (A['bom'],'hit',-27),(A['bon'],'paper',-27),(A['sehat']+.35,'pop',-28),(A['scale']+.3,'slide',-28)]
# Named graphic beats, camera moves, icon landings and phrase entrances.
# Each word is still revealed acoustically; subtle text sounds belong to phrases.
motion=json.loads((HERE/'motion.json').read_text()); captions=json.loads((HERE/'captions-styled.json').read_text())
cues=[(t,k,db+6) for t,k,db in cues]+[(.06,'swish',-25),(.62,'slide',-31)]
def visible(t):return not any(s['mode']=='full' and s['start']<=t<s['end'] for s in plan['scenes']) and not A['hiroshima']-.15<=t<A['bon']+.6
for s in plan['scenes']:
 if s['mode']=='full':cues.extend([(s['start']+.1,'swish',-26),(s['end']-.07,'swish',-31)])
cues.extend([(scene['illusion']['start']+.95,'pop',-25),(A['marginHealth'],'click',-25),
 (A['sehat']+.2,'hit',-25),(A['scale']+.15,'slide',-25),(A['scale']+.35,'pop',-28),(A['scale']+.55,'pop',-28)])
cues.extend([(9.7,'click',-33),(10.0,'click',-33),(10.25,'click',-33),
 (21.3,'click',-27),(28.18,'click',-25),(36.22,'click',-28)])
for b in motion['cameraBeats']:
 cues.extend([(b['start']+.1,'swish',-30),(b['end']-.15,'swish',-33)])
for b in motion['icons']:cues.append((b['start']+.12,b['sound'],-22))
for g in captions:
 if visible(g['start']):cues.append((g['start']+.025,'click',-34))
 for w in g['words']:
  if w['motion']!='rise' and visible(w['start']):cues.append((w['start']+.025,'slide' if w['motion']=='sweep' else 'pop',-31))
# Nearby effects of the same kind use the stronger hit, avoiding stacked copies.
dedup=[]
for cue in sorted(cues,key=lambda c:c[2],reverse=True):
 if not any(cue[1]==c[1] and abs(cue[0]-c[0])<.18 for c in dedup):dedup.append(cue)
cues=sorted(dedup)
track=np.zeros(n,np.float32); placed=[]
for at,key,db in cues:
 contact=round(at*30)/30; x,peak=sounds[key]; pos=round(contact*rate)-peak; gain=10**(db/20)
 a=max(0,pos); b=min(n,pos+len(x)); track[a:b]+=x[a-pos:b-pos]*gain
 placed.append({'contactFrame':round(contact*30),'contactSeconds':contact,'sound':key,'peakDBFSBeforeMaster':db,'audibleStartSeconds':pos/rate})
MEDIA.mkdir(parents=True,exist_ok=True); OUT.mkdir(parents=True,exist_ok=True)
wavfile.write(MEDIA/'sfx.wav',rate,(np.clip(track,-1,1)*32767).astype(np.int16))
voice=norm(ROOT/'public'/plan['source'],MEDIA/'voice.wav',-16,-3,'highpass=f=70,acompressor=threshold=0.1:ratio=1.6:attack=10:release=110')
run(['-i',str(MEDIA/'voice.wav'),'-i',str(MEDIA/'sfx.wav'),'-filter_complex','[0:a]asplit=2[v][key];[1:a][key]sidechaincompress=threshold=0.12:ratio=2:attack=3:release=90[sfx];[v][sfx]amix=inputs=2:normalize=0:duration=first,atrim=duration=52[m]','-map','[m]','-ar',str(rate),'-c:a','pcm_s24le',str(OUT/'premaster.wav')])
norm(OUT/'premaster.wav',MEDIA/'master.wav',-14,-1.8)
(HERE/'sfx.json').write_text(json.dumps({'music':False,'mixInputs':['original-dialogue','library-sfx'],'sources':sources,'cues':placed},ensure_ascii=False,indent=2)+'\n')
print('Placed',len(placed),'real library SFX; peaks aligned to contact frames; voice clock unchanged.')
