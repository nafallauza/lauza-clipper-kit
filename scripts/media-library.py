#!/usr/bin/env python3
"""Index local ZIP media; search bounded results and extract selected assets only."""
import argparse
import hashlib
import json
import re
import shutil
import sqlite3
import stat
import subprocess
import zipfile
from pathlib import Path, PurePosixPath

AUDIO = {'.wav', '.mp3', '.m4a', '.ogg', '.flac', '.aac'}
VIDEO = {'.mp4', '.mov', '.webm'}
CATEGORIES = [
    ('music', ['bg music', 'background music', 'backsound', 'bgm', 'music']),
    ('whoosh', ['whoosh', 'swoosh', 'swipe', 'sweep', 'zoom']),
    ('paper', ['paper', 'page', 'kertas', 'receipt', 'book']),
    ('typing', ['typing', 'keyboard', 'typewriter']),
    ('notification', ['notification', 'notify', 'beep', 'ping', 'bell', 'ding']),
    ('camera', ['camera', 'shutter']),
    ('click', ['click', 'tap', 'button', 'switch', 'pop']),
    ('money', ['cash', 'coin', 'money', 'register']),
    ('impact', ['impact', 'hit', 'punch', 'slam', 'boom', 'bass', 'thud']),
    ('meme', ['meme', 'bruh', 'vine', 'dayum', 'rimshot', 'laugh']),
    ('ambient', ['environment', 'ambient', 'rain', 'wind', 'water', 'forest']),
]


def classify(name, kind):
    if kind == 'lut':
        return 'lut'
    return next((category for category, terms in CATEGORIES if any(t in name.lower() for t in terms)), 'other')


def index(db, paths):
    for path in paths:
        archive = str(Path(path).expanduser().resolve(strict=True))
        db.execute('DELETE FROM assets WHERE archive=?', (archive,))
        with zipfile.ZipFile(archive) as z:
            rows = []
            for info in z.infolist():
                if info.is_dir():
                    continue
                member = info.filename
                ext = Path(member).suffix.lower()
                kind = 'lut' if ext == '.cube' else 'sfx' if ext in AUDIO else 'video' if ext in VIDEO else 'other'
                parts = PurePosixPath(member.replace('\\', '/'))
                safe = not parts.is_absolute() and '..' not in parts.parts and not stat.S_ISLNK(info.external_attr >> 16)
                ready = int(safe and info.file_size > 0 and not info.flag_bits & 1 and kind != 'other')
                meta = {'license': 'not established from archive metadata', 'probed': False}
                if ready and kind == 'lut':
                    with z.open(info) as f:
                        header = f.read(16384).decode('utf-8-sig', errors='replace')
                    m = re.search(r'^\s*LUT_(1D|3D)_SIZE\s+(\d+)', header, re.M)
                    meta.update(lutType=m.group(1) if m else None, lutSize=int(m.group(2)) if m else None)
                    ready = int(bool(m))
                rows.append((archive, member, kind, classify(member, kind), info.file_size, info.CRC, ready, json.dumps(meta)))
            db.executemany('INSERT OR REPLACE INTO assets(archive,member,kind,category,bytes,crc,ready,metadata) VALUES(?,?,?,?,?,?,?,?)', rows)
        db.commit()
        print(json.dumps({'archive': Path(archive).name, 'entries': len(rows), 'readyByKind': dict(db.execute('SELECT kind,count(*) FROM assets WHERE archive=? AND ready=1 GROUP BY kind', (archive,)).fetchall())}))


def search(db, args):
    where, params = ['ready=1'], []
    for name in ['kind', 'category']:
        value = getattr(args, name)
        if value:
            where.append(name+'=?')
            params.append(value)
    for term in ' '.join(args.query).lower().split():
        where.append('(lower(member) LIKE ? OR category LIKE ?)')
        params.extend(['%'+term+'%']*2)
    params.append(max(1, min(args.limit, 20)))
    sql = 'SELECT id,kind,category,bytes,member,metadata FROM assets WHERE '+' AND '.join(where)+' ORDER BY length(member),member LIMIT ?'
    for row in db.execute(sql, params):
        data = dict(row)
        data['metadata'] = json.loads(data['metadata'])
        print(json.dumps(data, ensure_ascii=False))


def extract(db, db_path, asset_id):
    row = db.execute('SELECT * FROM assets WHERE id=? AND ready=1', (asset_id,)).fetchone()
    if row is None:
        raise SystemExit('Asset not found or not usable; search the catalog first.')
    token = hashlib.sha256((row['archive']+'\n'+row['member']+str(row['crc'])).encode()).hexdigest()[:12]
    name = re.sub(r'[^A-Za-z0-9.\-]+', '-', PurePosixPath(row['member']).name)
    name = Path(name).stem[:140]+Path(name).suffix
    target = db_path.parent/'cache'/row['kind']/(token+'-'+name)
    target.parent.mkdir(parents=True, exist_ok=True)
    if not target.exists():
        temp = target.with_name(target.name+'.partial')
        try:
            with zipfile.ZipFile(row['archive']) as z:
                info = z.getinfo(row['member'])
                if (info.CRC, info.file_size) != (row['crc'], row['bytes']):
                    raise SystemExit('Archive changed; rebuild its index before extracting.')
                with z.open(info) as src, temp.open('wb') as dst:
                    shutil.copyfileobj(src, dst)
            temp.replace(target)
        finally:
            temp.unlink(missing_ok=True)
    metadata = json.loads(row['metadata'])
    if row['kind'] in {'sfx', 'video'} and shutil.which('ffprobe'):
        result = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration:stream=codec_type,codec_name,sample_rate,channels', '-of', 'json', str(target)], capture_output=True, text=True)
        if result.returncode:
            raise SystemExit('Selected media failed ffprobe: '+target.name)
        metadata.update(probed=True, media=json.loads(result.stdout))
        db.execute('UPDATE assets SET metadata=? WHERE id=?', (json.dumps(metadata), asset_id))
        db.commit()
    print(json.dumps({'id': asset_id, 'path': str(target), 'metadata': metadata}, ensure_ascii=False))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--db', type=Path, default=Path('asset-library/catalog.sqlite3'))
    sub = parser.add_subparsers(dest='command', required=True)
    p = sub.add_parser('index'); p.add_argument('archives', nargs='+')
    p = sub.add_parser('search'); p.add_argument('query', nargs='*'); p.add_argument('--kind', choices=['lut','sfx','video']); p.add_argument('--category'); p.add_argument('--limit', type=int, default=6)
    p = sub.add_parser('extract'); p.add_argument('id', type=int)
    args = parser.parse_args()
    if args.command != 'index' and not args.db.exists():
        parser.error('Catalog missing; index archives first.')
    args.db.parent.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(args.db); db.row_factory = sqlite3.Row
    db.execute('CREATE TABLE IF NOT EXISTS assets(id INTEGER PRIMARY KEY, archive TEXT, member TEXT, kind TEXT, category TEXT, bytes INTEGER, crc INTEGER, ready INTEGER, metadata TEXT, UNIQUE(archive,member))')
    try:
        if args.command == 'index': index(db, args.archives)
        elif args.command == 'search': search(db, args)
        else: extract(db, args.db.resolve(), args.id)
    finally:
        db.close()


if __name__ == '__main__':
    main()
