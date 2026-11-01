"""Mobile-first spoken captions: modern bold prose and deliberate editorial accents."""
import json
from pathlib import Path
from PIL import ImageFont
HERE=Path(__file__).resolve().parent; ROOT=HERE.parents[2]; fonts=ROOT/'public/shared/fonts'
groups=json.loads((HERE/'captions.json').read_text()); plan=json.loads((HERE/'plan.json').read_text()); A=plan['anchors']
FACES={
 'modern':('Adwaita Sans','AdwaitaSans-Regular.ttf','normal'),
 'display':('Montserrat','Montserrat-ExtraBold.otf','normal'),
 'italic':('Caladea','Caladea-Italic.ttf','italic')}
HERO={'omzet':('display',112,800),'cash':('display',116,800),'piutang':('italic',122,400)}
# Selected sentence beats follow the reference's small lead / large main idea.
# Indices refer to the unmodified acoustic words; styling never retimes speech.
EDITORIAL={
 0.0:(1,2,'display',98),
 2.68:(1,2,'modern',88),
 7.88:(3,4,'italic',104),
 9.04:(2,4,'display',90),
 10.58:(3,4,'italic',108),
 18.24:(2,3,'display',118),
 39.3:(3,4,'display',112),
 44.98:(1,2,'italic',112)}
KEEP_TOGETHER={('kerja','keras'),('net','profit'),('early','stage'),('scale','up'),('bisa','menikmati'),('di','atas'),('atas','kertas')}
cache={}
def font(w):
 key=(w['face'],w['size'],w['weight'])
 if key not in cache:
  f=ImageFont.truetype(str(fonts/FACES[w['face']][1]),w['size'])
  if w['face']=='modern': f.set_variation_by_axes([32,w['weight']])
  cache[key]=f
 return cache[key]
def stem(word):return word.lower().strip('.,?!').replace('omset','omzet')
def measure(w):w['width']=round(font(w).getlength(w['text']),3)
def hidden(t):return any(s['mode']=='full' and s['start']<=t<s['end'] for s in plan['scenes']) or A['hiroshima']-.15<=t<A['bon']+.6
def space(row):return max(15,min(21,sum(w['size'] for w in row)/len(row)*.25))
def width(row):return sum(w['width'] for w in row)+space(row)*(len(row)-1)
def wrap(row):
 if not row:return []
 if width(row)<=810:return [row]
 options=[]
 for i in range(1,len(row)):
  if max(width(row[:i]),width(row[i:]))>810:continue
  penalty=1200 if (stem(row[i-1]['original']),stem(row[i]['original'])) in KEEP_TOGETHER else 0
  penalty+=80 if min(i,len(row)-i)==1 else 0
  options.append((abs(width(row[:i])-width(row[i:]))+penalty,i))
 if not options:
  for w in row:w['size']-=2;measure(w)
  return wrap(row)
 cut=min(options)[1];return [row[:cut],row[cut:]]
seen=set(); result=[]
for group in groups:
 words=[dict(w) for w in group['words']]
 for w in words:
  w.update(text=w['original'].strip('.,'),face='modern',size=80,weight=700,highlight=False,emphasis='none');measure(w)
 candidates=[(0 if stem(w['original'])=='piutang' else 1 if stem(w['original'])=='cash' else 2,i) for i,w in enumerate(words) if stem(w['original']) in HERO]
 rows=[]
 if candidates:
  _,i=min(candidates); key=stem(words[i]['original']); face,size,weight=HERO[key]
  for w in words[:i]+words[i+1:]:
   w.update(size=74,weight=600)
   if key=='omzet':w.update(face='italic',size=76,weight=400)
   measure(w)
  hero=words[i];hero.update(face=face,size=size,weight=weight,text=hero['text'].upper() if face=='display' else hero['text']);measure(hero)
  if not hidden(hero['start']) and key not in seen:
   hero['emphasis']={'omzet':'yellow-text','cash':'yellow-marker','piutang':'yellow-underline'}[key];seen.add(key)
  for row in [words[:i],[hero],words[i+1:]]:rows.extend(wrap(row))
 elif group['start'] in EDITORIAL:
  lo,hi,face,size=EDITORIAL[group['start']]
  assert 0<=lo<hi<=len(words)
  for i,w in enumerate(words):
   main=lo<=i<hi
   w.update(face=face if main else 'modern',size=size if main else 74,weight=(800 if face=='display' else 700 if face=='modern' else 400) if main else 600)
   if main and face=='display':w['text']=w['text'].upper()
   measure(w)
  for row in [words[:lo],words[lo:hi],words[hi:]]:rows.extend(wrap(row))
 else:
  inline={3.82:(1,'italic',94),11.6:(2,'italic',92),28.58:(0,'display',82),35.18:(4,'display',94)}.get(group['start'])
  if inline:
   i,face,size=inline;words[i].update(face=face,size=size,weight=400 if face=='italic' else 800);measure(words[i])
  rows=wrap(words)
 measures=[]
 for row in rows:
  boxes=[font(w).getbbox(w['text'],anchor='ls') for w in row];measures.append((min(b[1] for b in boxes),max(b[3] for b in boxes)))
 gap=12;total=sum(b-a for a,b in measures)+gap*(len(rows)-1);center=1420;cursor=center-total/2
 for row,(top,bottom) in zip(rows,measures):
  x=(1010-width(row))/2;baseline=cursor-top
  for w in row:
   family,_,style=FACES[w['face']];w.update(family=family,fontStyle=style,x=round(x,3),y=round(baseline,3),motion='pop' if w['size']>=88 and w['face']=='display' else 'sweep' if w['size']>=88 and w['face']=='italic' else 'rise');x+=w['width']+space(row)
  cursor+=bottom-top+gap
 record={**group,'words':words,'layout':'mobile-editorial','top':center-total/2,'bottom':center+total/2}
 assert 1200<=record['top'] and record['bottom']<=1580
 assert all(75<=w['x'] and w['x']+w['width']<=935 for w in words)
 result.append(record)
# Hold through existing silence only, and shorten entrances near a cut.
for i,g in enumerate(result):
 if i+1<len(result):g['end']=min(result[i+1]['start'],max(g['end'],g['words'][-1]['end']+.12))
 for j,w in enumerate(g['words']):
  w['direction']=('left' if i%2==0 else 'right') if w['size']>=88 else ['down','left','right','up'][i%4]
  if j==0 and w['size']<88:w['direction']='down'
  visible_end=g['end']
  for s in plan['scenes']:
   if s['mode']=='full' and w['start']<s['start']<visible_end:visible_end=s['start']
  if w['start']<A['hiroshima']-.15<visible_end:visible_end=A['hiroshima']-.15
  available=visible_end-w['start']
  w['entranceSeconds']=round(min(.14 if w['motion']!='rise' else .075,max(.025,available*.2)),4)
  if available<.32:w['motion']='rise'
(HERE/'captions-styled.json').write_text(json.dumps(result,ensure_ascii=False)+'\n')
print('47 phrase groups; expressive word entrances; caption center 1420 px; acoustic timings preserved.')
