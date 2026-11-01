"""Create a review scaffold from a real clip and optional word-level acoustic intervals."""
import argparse,json,math,re,shutil,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
p=argparse.ArgumentParser(description=__doc__);p.add_argument('--name',required=True);p.add_argument('--brand',choices=['lauza','vordev'],default='lauza');p.add_argument('--video',required=True,type=Path);p.add_argument('--words',type=Path);a=p.parse_args()
if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',a.name):p.error('Use a lowercase slug, e.g. cash-reality.')
video=a.video.expanduser().resolve(strict=True);job=ROOT/'brands'/a.brand/a.name;public=ROOT/'public/brands'/a.brand/a.name
if job.exists() or public.exists():p.error('Job already exists; choose another name.')
meta=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(video)]));v=next(x for x in meta['streams'] if x['codec_type']=='video');duration=float(meta['format']['duration']);words=[];raw=[]
if a.words:
 raw=json.loads(a.words.expanduser().read_text());items=raw.get('words') if isinstance(raw,dict) else raw
 if not isinstance(items,list):p.error('Expected a word list or {"words": [...]}.')
 for item in items:
  text=item.get('w',item.get('text'))
  if 's' in item and 'e' in item:s,e=item['s'],item['e']
  elif 'startFrame' in item and 'endFrame' in item:s,e=item['startFrame']/30,item['endFrame']/30
  elif 'start' in item and 'end' in item:s,e=item['start'],item['end']
  else:p.error('Each word needs explicit acoustic timestamps; phrase estimates are unsupported.')
  if not isinstance(text,str) or not text.strip() or len(text.split())>2:p.error('Expected actual words, not sentence-level captions.')
  if not (0<=float(s)<float(e)<=duration+.05):p.error('Word interval outside source duration.')
  words.append({'w':text,'s':float(s),'e':float(e)})
 if any(x['e']>y['s']+.001 for x,y in zip(words,words[1:])):p.error('Overlapping or unsorted intervals; review the alignment first.')
job.mkdir(parents=True);public.mkdir(parents=True);source=f'brands/{a.brand}/{a.name}/source{video.suffix.lower()}';shutil.copy2(video,ROOT/'public'/source)
plan={'name':a.name,'brand':a.brand,'source':source,'fps':30,'width':1080,'height':1920,'duration':duration,'frames':math.ceil(duration*30),'sourceWidth':v['width'],'sourceHeight':v['height'],'sourceFrameRate':v.get('avg_frame_rate'),'videoDelayFrames':0,'wordTimingStatus':'provided-requires-review' if words else 'awaiting-acoustic-alignment','framingStatus':'provisional-center-requires-shot-and-face-review','speakerPolicy':'identify-active-speaker-per-shot','status':'review-scaffold-not-final','styleConfig':'brands/lauza/style.json' if a.brand=='lauza' else None,'styleReference':'brands/lauza/timothy-reference' if a.brand=='lauza' else None,'brandBriefStatus':'approved-style' if a.brand=='lauza' else 'required','addedMusic':False}
(job/'plan.json').write_text(json.dumps(plan,indent=2)+'\n');(job/'words.input.json').write_text(json.dumps(raw,ensure_ascii=False,indent=2)+'\n');(job/'words.normalized.json').write_text(json.dumps(words,ensure_ascii=False,indent=2)+'\n')
(job/'Clip.tsx').write_text("import {ReviewClip} from '../../../src/shared/ReviewClip';\nimport plan from './plan.json';\nimport words from './words.normalized.json';\nexport const Clip=()=> <ReviewClip source={plan.source} words={words}/>;\n")
(job/'README.md').write_text('Review scaffold only. Register Clip in src/Root.tsx using plan.frames at 30 fps.\nCheck crop per camera angle and acoustic words before designing graphics.\nUse docs/STYLE.md and docs/WORKFLOW.md; do not reuse Timothy numbers or timings.\nVordev requires its own brand brief before adopting Lauza styling.\n')
print(json.dumps({'job':str(job.relative_to(ROOT)),'frames':plan['frames'],'words':len(words),'status':plan['status']},indent=2))
