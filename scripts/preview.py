"""Local static preview with a macOS mixed file/folder picker; no external uploads."""
import argparse
import hashlib
import json
import mimetypes
from pathlib import Path
import platform
import subprocess
import tempfile
import threading
import uuid
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

ROOT = Path(__file__).resolve().parent.parent
PREFIX = '/__local_picker/'
PANEL_LOCK = threading.Lock()
ITEMS = {}
ITEMS_LOCK = threading.Lock()


def picker_binary():
    if platform.system() != 'Darwin':
        return None
    source = ROOT / 'scripts/local-file-picker.swift'
    digest = hashlib.sha256(source.read_bytes()).hexdigest()[:12]
    bundle = Path(tempfile.gettempdir()) / ('aiops-picker-' + digest) / 'AIOps File Picker.app'
    executable = bundle / 'Contents/MacOS/AIOpsFilePicker'
    if not executable.exists():
        executable.parent.mkdir(parents=True, exist_ok=True)
        (bundle / 'Contents/Info.plist').write_text('''<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0"><dict><key>CFBundleIdentifier</key><string>com.agentos.local-file-picker</string><key>CFBundleExecutable</key><string>AIOpsFilePicker</string><key>CFBundleName</key><string>AIOps File Picker</string><key>CFBundlePackageType</key><string>APPL</string></dict></plist>''')
        subprocess.run(['swiftc', '-module-cache-path', str(Path(tempfile.gettempdir()) / 'aiops-picker-module-cache'), str(source), '-o', str(executable)], check=True)
    return executable


def register(path, display_path=None):
    path = Path(path)
    stat = path.stat()
    token = uuid.uuid4().hex
    with ITEMS_LOCK:
        ITEMS[token] = (path, display_path or path.name)
    return {'token': token, 'name': path.name, 'path': display_path or path.name,
            'kind': 'directory' if path.is_dir() else 'file', 'size': stat.st_size,
            'mime': mimetypes.guess_type(path.name)[0] or 'application/octet-stream',
            'modified': int(stat.st_mtime * 1000)}


class PreviewHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def api_allowed(self):
        origin = self.headers.get('Origin')
        hosts = {'127.0.0.1:' + str(self.server.server_port), 'localhost:' + str(self.server.server_port)}
        return self.headers.get('Host') in hosts and (not origin or origin in {'http://' + h for h in hosts})

    def json_response(self, payload, status=200):
        body = json.dumps(payload, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if urlparse(self.path).path != PREFIX + 'pick':
            return self.json_response({'error': 'Not found'}, 404)
        if not self.api_allowed() or self.headers.get('Content-Type') != 'application/json':
            return self.json_response({'error': 'Local preview origin required'}, 403)
        if not self.server.picker:
            return self.json_response({'error': 'Native picker unavailable'}, 501)
        if not PANEL_LOCK.acquire(blocking=False):
            return self.json_response({'error': 'A file picker is already open'}, 409)
        try:
            with tempfile.NamedTemporaryFile(prefix='aiops-selection-', suffix='.json', delete=False) as selection:
                result_path = Path(selection.name)
            try:
                subprocess.run(['open', '-W', '-n', str(self.server.picker.parents[2]), '--args', str(result_path)], capture_output=True, check=True)
                paths = json.loads(result_path.read_text())
            finally:
                result_path.unlink(missing_ok=True)
            self.json_response({'items': [register(path) for path in paths]})
        except (OSError, subprocess.SubprocessError, ValueError):
            self.json_response({'error': 'Unable to open local file picker'}, 500)
        finally:
            PANEL_LOCK.release()

    def do_GET(self):
        path = urlparse(self.path).path
        if not path.startswith(PREFIX):
            return super().do_GET()
        if not self.api_allowed():
            return self.json_response({'error': 'Local preview origin required'}, 403)
        if path == PREFIX + 'status':
            return self.json_response({'mixedSelection': bool(self.server.picker)})
        token = path.removeprefix(PREFIX + 'items/')
        with ITEMS_LOCK:
            item = ITEMS.get(token)
        if not item:
            return self.json_response({'error': 'Item not found'}, 404)
        file, display_path = item
        try:
            if file.is_dir():
                children = sorted((p for p in file.iterdir() if not p.is_symlink()), key=lambda p: (not p.is_dir(), p.name.lower()))
                return self.json_response({'items': [register(p, display_path + '/' + p.name) for p in children]})
            text_preview = parse_qs(urlparse(self.path).query).get('text') == ['1']
            self.send_response(200)
            self.send_header('Content-Type', mimetypes.guess_type(file.name)[0] or 'application/octet-stream')
            self.send_header('Content-Length', str(min(file.stat().st_size, 200000) if text_preview else file.stat().st_size))
            self.send_header('Cache-Control', 'no-store')
            self.send_header('X-Content-Type-Options', 'nosniff')
            self.end_headers()
            with file.open('rb') as stream:
                if text_preview:
                    self.wfile.write(stream.read(200000))
                else:
                    self.copyfile(stream, self.wfile)
        except (FileNotFoundError, PermissionError):
            self.json_response({'error': 'Item no longer accessible'}, 404)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=8000)
    args = parser.parse_args()
    native_picker = picker_binary()
    server = ThreadingHTTPServer(('127.0.0.1', args.port), PreviewHandler)
    server.picker = native_picker
    print('Preview: http://127.0.0.1:' + str(args.port) + '/workbench/aiops/index.html', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
