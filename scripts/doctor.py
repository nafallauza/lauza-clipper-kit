"""Read-only environment check; --job additionally checks external production media."""
import argparse,importlib.util,json,shutil,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
p=argparse.ArgumentParser(description=__doc__);p.add_argument('--job',type=Path);a=p.parse_args()
def version(exe):
 path=shutil.which(exe)
 if not path:return {'available':False}
 r=subprocess.run([path,'-version' if exe in ('ffmpeg','ffprobe') else '--version'],capture_output=True,text=True)
 return {'available':r.returncode==0,'version':(r.stdout or r.stderr).splitlines()[0][:160]}
report={'python':sys.version.split()[0],'tools':{k:version(k) for k in ['node','npm','ffmpeg','ffprobe']},'nodeModules':(ROOT/'node_modules').exists(),'optionalPythonPackages':{k:importlib.util.find_spec(k) is not None for k in ['PIL','numpy','scipy']},'localFonts':all((ROOT/'public/shared/fonts'/f).exists() for f in ['AdwaitaSans-Regular.ttf','Montserrat-ExtraBold.otf','Caladea-Italic.ttf'])}
if a.job:
 job=a.job if a.job.is_absolute() else ROOT/a.job;plan=json.loads((job/'plan.json').read_text());audio=ROOT/'public'/Path(plan['source']).parent/'master.wav'
 report['job']={'sourcePresent':(ROOT/'public'/plan['source']).is_file(),'masterAudioPresent':audio.is_file(),'source':plan['source']}
print(json.dumps(report,indent=2))
