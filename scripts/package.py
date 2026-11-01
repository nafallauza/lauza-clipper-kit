"""Zip tracked project files only; media, .git, dependencies and caches stay local."""
import hashlib,json,subprocess,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
files=subprocess.check_output(['git','ls-files','-z'],cwd=ROOT).decode().split('\0');files=[p for p in files if p]
if not files:raise SystemExit('No tracked files. Stage the intended kit files first.')
out=ROOT.parent/(ROOT.name+'.zip')
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as z:
 for name in files:
  p=ROOT/name
  if p.is_symlink():raise SystemExit('Refusing to follow tracked symlink: '+name)
  if p.is_file():z.write(p,ROOT.name+'/'+name)
digest=hashlib.sha256(out.read_bytes()).hexdigest();out.with_suffix('.zip.sha256').write_text(digest+'  '+out.name+'\n')
print(json.dumps({'zip':str(out),'files':len(files),'bytes':out.stat().st_size,'sha256':digest},indent=2))
